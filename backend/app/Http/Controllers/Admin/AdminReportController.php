<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Report;
use App\Models\AdminLog;
use App\Models\Notification;
use Illuminate\Http\Request;

class AdminReportController extends Controller
{
    public function index(Request $request)
    {
        $query = Report::with(['reporter', 'reportable']);

        // Filter by status
        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        // Filter by type
        if ($type = $request->get('type')) {
            $query->where('reportable_type', $type);
        }

        // Filter by reason
        if ($reason = $request->get('reason')) {
            $query->where('reason', $reason);
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $reports = $query->paginate($request->get('per_page', 20));

        return response()->json($reports);
    }

    public function show(Report $report)
    {
        $report->load(['reporter', 'reportable', 'reviewer']);

        return response()->json([
            'report' => $report,
        ]);
    }

    public function resolve(Request $request, Report $report)
    {
        $request->validate([
            'action' => 'required|in:warn,remove,suspend,dismiss',
            'notes' => 'nullable|string|max:1000',
        ]);

        $report->update([
            'status' => 'resolved',
            'resolved_at' => now(),
            'reviewed_by' => $request->user()->id,
            'resolution_action' => $request->action,
            'resolution_notes' => $request->notes,
        ]);

        // Handle the action
        $this->handleReportAction($request, $report);

        // Log action
        AdminLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'report_resolved',
            'description' => "Resolved report #{$report->id} with action: {$request->action}",
            'target_type' => Report::class,
            'target_id' => $report->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Report resolved successfully',
            'report' => $report->fresh(['reporter', 'reportable', 'reviewer']),
        ]);
    }

    private function handleReportAction(Request $request, Report $report)
    {
        $reportable = $report->reportable;

        switch ($request->action) {
            case 'remove':
                if ($reportable) {
                    $reportable->delete();
                }
                break;

            case 'suspend':
                if ($report->reportable_type === 'App\\Models\\User') {
                    $reportable->update([
                        'is_suspended' => true,
                        'suspended_at' => now(),
                        'suspension_reason' => "Violated community guidelines: {$report->reason}",
                    ]);
                } elseif ($reportable && $reportable->user) {
                    $reportable->user->update([
                        'is_suspended' => true,
                        'suspended_at' => now(),
                        'suspension_reason' => "Violated community guidelines: {$report->reason}",
                    ]);
                }
                break;

            case 'warn':
                // Send warning notification
                if ($report->reportable_type === 'App\\Models\\User') {
                    $userId = $reportable->id;
                } elseif ($reportable && $reportable->user) {
                    $userId = $reportable->user_id;
                } else {
                    return;
                }

                Notification::create([
                    'user_id' => $userId,
                    'type' => 'warning',
                    'data' => [
                        'message' => 'Your content has been flagged for violating community guidelines.',
                        'reason' => $report->reason,
                    ],
                ]);
                break;

            case 'dismiss':
                // No action needed
                break;
        }
    }

    public function dismiss(Request $request, Report $report)
    {
        $request->validate([
            'notes' => 'nullable|string|max:1000',
        ]);

        $report->update([
            'status' => 'dismissed',
            'resolved_at' => now(),
            'reviewed_by' => $request->user()->id,
            'resolution_action' => 'dismiss',
            'resolution_notes' => $request->notes,
        ]);

        // Log action
        AdminLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'report_dismissed',
            'description' => "Dismissed report #{$report->id}",
            'target_type' => Report::class,
            'target_id' => $report->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Report dismissed',
            'report' => $report->fresh(),
        ]);
    }

    public function stats(Request $request)
    {
        $stats = [
            'total' => Report::count(),
            'pending' => Report::where('status', 'pending')->count(),
            'resolved' => Report::where('status', 'resolved')->count(),
            'dismissed' => Report::where('status', 'dismissed')->count(),
            'by_reason' => Report::groupBy('reason')
                ->selectRaw('reason, count(*) as count')
                ->pluck('count', 'reason'),
            'by_type' => Report::groupBy('reportable_type')
                ->selectRaw('reportable_type, count(*) as count')
                ->pluck('count', 'reportable_type'),
        ];

        return response()->json($stats);
    }
}

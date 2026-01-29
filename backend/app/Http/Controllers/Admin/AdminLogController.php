<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminLog;
use Illuminate\Http\Request;

class AdminLogController extends Controller
{
    public function index(Request $request)
    {
        $query = AdminLog::with('admin');

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('action', 'like', "%{$request->search}%")
                    ->orWhere('description', 'like', "%{$request->search}%");
            });
        }

        if ($request->admin_id) {
            $query->where('admin_id', $request->admin_id);
        }

        if ($request->action) {
            $query->where('action', $request->action);
        }

        if ($request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $logs = $query->latest()->paginate(50);

        return response()->json($logs);
    }

    public function actions()
    {
        $actions = AdminLog::select('action')
            ->distinct()
            ->pluck('action');

        return response()->json(['data' => $actions]);
    }

    public function export(Request $request)
    {
        $query = AdminLog::with('admin');

        if ($request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $logs = $query->latest()->get();

        $csv = "ID,Admin,Action,Description,IP Address,Date\n";
        foreach ($logs as $log) {
            $csv .= "\"{$log->id}\",\"{$log->admin->name}\",\"{$log->action}\",\"{$log->description}\",\"{$log->ip_address}\",\"{$log->created_at}\"\n";
        }

        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="admin_logs.csv"',
        ]);
    }
}

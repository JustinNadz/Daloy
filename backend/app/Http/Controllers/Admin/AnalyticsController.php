<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Post;
use App\Models\Report;
use App\Models\Group;
use App\Models\Reaction;
use App\Models\Follow;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    public function overview(Request $request)
    {
        $range = $request->get('range', '7d');
        $startDate = $this->getStartDate($range);

        return response()->json([
            'success' => true,
            'data' => [
                'users' => $this->getUserStats($startDate),
                'posts' => $this->getPostStats($startDate),
                'engagement' => $this->getEngagementStats($startDate),
                'reports' => $this->getReportStats($startDate),
            ],
        ]);
    }

    public function userGrowth(Request $request)
    {
        $range = $request->get('range', '30d');
        $startDate = $this->getStartDate($range);

        $data = User::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as count')
        )
            ->where('created_at', '>=', $startDate)
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    public function postActivity(Request $request)
    {
        $range = $request->get('range', '30d');
        $startDate = $this->getStartDate($range);

        $data = Post::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as count')
        )
            ->where('created_at', '>=', $startDate)
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    public function engagementMetrics(Request $request)
    {
        $range = $request->get('range', '30d');
        $startDate = $this->getStartDate($range);

        // Reactions over time
        $reactions = Reaction::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as count')
        )
            ->where('created_at', '>=', $startDate)
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Comments over time (posts with parent_id are comments)
        $comments = Post::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as count')
        )
            ->whereNotNull('parent_id')
            ->where('created_at', '>=', $startDate)
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'reactions' => $reactions,
                'comments' => $comments,
            ],
        ]);
    }

    public function topContent(Request $request)
    {
        $range = $request->get('range', '7d');
        $startDate = $this->getStartDate($range);

        // Top posts by engagement
        $topPosts = Post::withCount(['reactions', 'comments', 'reposts'])
            ->whereNull('parent_id')
            ->where('created_at', '>=', $startDate)
            ->orderByRaw('(reactions_count + comments_count + reposts_count) DESC')
            ->limit(10)
            ->with('user:id,username,display_name,avatar_url')
            ->get();

        // Top users by followers gained
        $topUsers = User::select('users.*')
            ->withCount(['followers' => function ($q) use ($startDate) {
                $q->where('follows.created_at', '>=', $startDate);
            }])
            ->orderBy('followers_count', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'posts' => $topPosts,
                'users' => $topUsers,
            ],
        ]);
    }

    public function demographics(Request $request)
    {
        // User registration sources (if tracked)
        $byStatus = User::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get();

        // Account types
        $byPrivacy = User::select('is_private', DB::raw('COUNT(*) as count'))
            ->groupBy('is_private')
            ->get();

        // Verified vs non-verified
        $byVerification = User::select('is_verified', DB::raw('COUNT(*) as count'))
            ->groupBy('is_verified')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'by_status' => $byStatus,
                'by_privacy' => $byPrivacy,
                'by_verification' => $byVerification,
            ],
        ]);
    }

    public function export(Request $request)
    {
        $type = $request->get('type', 'overview');
        $range = $request->get('range', '30d');
        $startDate = $this->getStartDate($range);

        $filename = "analytics_{$type}_{$range}_" . now()->format('Y-m-d') . ".csv";
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function () use ($type, $startDate) {
            $file = fopen('php://output', 'w');

            switch ($type) {
                case 'users':
                    fputcsv($file, ['Date', 'New Users', 'Total Users']);
                    $data = User::select(
                        DB::raw('DATE(created_at) as date'),
                        DB::raw('COUNT(*) as count')
                    )
                        ->where('created_at', '>=', $startDate)
                        ->groupBy('date')
                        ->orderBy('date')
                        ->get();
                    
                    $total = User::where('created_at', '<', $startDate)->count();
                    foreach ($data as $row) {
                        $total += $row->count;
                        fputcsv($file, [$row->date, $row->count, $total]);
                    }
                    break;

                case 'posts':
                    fputcsv($file, ['Date', 'New Posts', 'Total Posts']);
                    $data = Post::select(
                        DB::raw('DATE(created_at) as date'),
                        DB::raw('COUNT(*) as count')
                    )
                        ->where('created_at', '>=', $startDate)
                        ->groupBy('date')
                        ->orderBy('date')
                        ->get();
                    
                    $total = Post::where('created_at', '<', $startDate)->count();
                    foreach ($data as $row) {
                        $total += $row->count;
                        fputcsv($file, [$row->date, $row->count, $total]);
                    }
                    break;

                default:
                    fputcsv($file, ['Metric', 'Value']);
                    fputcsv($file, ['Total Users', User::count()]);
                    fputcsv($file, ['Total Posts', Post::count()]);
                    fputcsv($file, ['Total Groups', Group::count()]);
                    fputcsv($file, ['Pending Reports', Report::where('status', 'pending')->count()]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function getStartDate($range)
    {
        return match ($range) {
            '24h' => Carbon::now()->subDay(),
            '7d' => Carbon::now()->subDays(7),
            '30d' => Carbon::now()->subDays(30),
            '90d' => Carbon::now()->subDays(90),
            '1y' => Carbon::now()->subYear(),
            default => Carbon::now()->subDays(7),
        };
    }

    private function getUserStats($startDate)
    {
        $total = User::count();
        $newUsers = User::where('created_at', '>=', $startDate)->count();
        $activeUsers = User::where('last_active_at', '>=', $startDate)->count();
        $previousPeriodNew = User::where('created_at', '>=', $startDate->copy()->subDays($startDate->diffInDays(now())))
            ->where('created_at', '<', $startDate)
            ->count();

        $growth = $previousPeriodNew > 0 
            ? round((($newUsers - $previousPeriodNew) / $previousPeriodNew) * 100, 1)
            : 0;

        return [
            'total' => $total,
            'new' => $newUsers,
            'active' => $activeUsers,
            'growth' => $growth,
        ];
    }

    private function getPostStats($startDate)
    {
        $total = Post::count();
        $newPosts = Post::where('created_at', '>=', $startDate)->count();
        $avgPerDay = round($newPosts / max(1, $startDate->diffInDays(now())), 1);

        return [
            'total' => $total,
            'new' => $newPosts,
            'avg_per_day' => $avgPerDay,
        ];
    }

    private function getEngagementStats($startDate)
    {
        $reactions = Reaction::where('created_at', '>=', $startDate)->count();
        $comments = Post::whereNotNull('parent_id')->where('created_at', '>=', $startDate)->count();
        $reposts = Post::whereNotNull('repost_of_id')->where('created_at', '>=', $startDate)->count();

        return [
            'reactions' => $reactions,
            'comments' => $comments,
            'reposts' => $reposts,
            'total' => $reactions + $comments + $reposts,
        ];
    }

    private function getReportStats($startDate)
    {
        $total = Report::where('created_at', '>=', $startDate)->count();
        $pending = Report::where('status', 'pending')->count();
        $resolved = Report::where('status', 'resolved')->where('updated_at', '>=', $startDate)->count();

        return [
            'total' => $total,
            'pending' => $pending,
            'resolved' => $resolved,
        ];
    }
}

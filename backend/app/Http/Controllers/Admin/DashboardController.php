<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Post;
use App\Models\Report;
use App\Models\AdminLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        $now = Carbon::now();
        $lastMonth = $now->copy()->subMonth();
        $lastWeek = $now->copy()->subWeek();
        $today = $now->copy()->startOfDay();

        // User stats
        $totalUsers = User::count();
        $newUsersThisMonth = User::where('created_at', '>=', $lastMonth)->count();
        $newUsersLastMonth = User::whereBetween('created_at', [$lastMonth->copy()->subMonth(), $lastMonth])->count();
        $userGrowth = $newUsersLastMonth > 0 
            ? round((($newUsersThisMonth - $newUsersLastMonth) / $newUsersLastMonth) * 100, 1)
            : 100;
        $newUsersToday = User::where('created_at', '>=', $today)->count();

        // Post stats
        $totalPosts = Post::count();
        $newPostsThisMonth = Post::where('created_at', '>=', $lastMonth)->count();
        $newPostsLastMonth = Post::whereBetween('created_at', [$lastMonth->copy()->subMonth(), $lastMonth])->count();
        $postGrowth = $newPostsLastMonth > 0 
            ? round((($newPostsThisMonth - $newPostsLastMonth) / $newPostsLastMonth) * 100, 1)
            : 100;

        // Report stats
        $pendingReports = Report::where('status', 'pending')->count();
        $reportsThisWeek = Report::where('created_at', '>=', $lastWeek)->count();
        $reportsLastWeek = Report::whereBetween('created_at', [$lastWeek->copy()->subWeek(), $lastWeek])->count();
        $reportChange = $reportsLastWeek > 0 
            ? round((($reportsThisWeek - $reportsLastWeek) / $reportsLastWeek) * 100, 1)
            : 0;

        // Recent reports
        $recentReports = Report::with(['reporter:id,username', 'reportable'])
            ->latest()
            ->take(5)
            ->get();

        // Chart data for user growth (last 7 days)
        $userGrowthChart = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = $now->copy()->subDays($i);
            $count = User::whereDate('created_at', $date)->count();
            $userGrowthChart[] = [
                'date' => $date->format('M d'),
                'users' => $count,
            ];
        }

        // Chart data for post activity (last 7 days)
        $postActivityChart = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = $now->copy()->subDays($i);
            $count = Post::whereDate('created_at', $date)->count();
            $postActivityChart[] = [
                'date' => $date->format('M d'),
                'posts' => $count,
            ];
        }

        return response()->json([
            'data' => [
                'users' => [
                    'total' => $totalUsers,
                    'change' => $userGrowth,
                    'today' => $newUsersToday,
                ],
                'posts' => [
                    'total' => $totalPosts,
                    'change' => $postGrowth,
                ],
                'reports' => [
                    'pending' => $pendingReports,
                    'change' => $reportChange,
                ],
                'charts' => [
                    'userGrowth' => $userGrowthChart,
                    'postActivity' => $postActivityChart,
                ],
                'recentReports' => $recentReports,
            ],
        ]);
    }

    public function chartData(Request $request)
    {
        $days = $request->get('days', 30);
        $startDate = Carbon::now()->subDays($days);

        // Users chart data
        $usersData = User::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as count')
        )
            ->where('created_at', '>=', $startDate)
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Posts chart data
        $postsData = Post::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as count')
        )
            ->where('created_at', '>=', $startDate)
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Fill in missing dates
        $usersChart = $this->fillMissingDates($usersData, $startDate, $days);
        $postsChart = $this->fillMissingDates($postsData, $startDate, $days);

        return response()->json([
            'users' => $usersChart,
            'posts' => $postsChart,
        ]);
    }

    private function fillMissingDates($data, $startDate, $days)
    {
        $result = [];
        $dataByDate = $data->keyBy('date');

        for ($i = 0; $i < $days; $i++) {
            $date = $startDate->copy()->addDays($i)->format('Y-m-d');
            $result[] = [
                'date' => $date,
                'count' => $dataByDate->has($date) ? $dataByDate[$date]->count : 0,
            ];
        }

        return $result;
    }

    public function recentActivity(Request $request)
    {
        $logs = AdminLog::with('admin')
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get();

        return response()->json([
            'activities' => $logs,
        ]);
    }
}

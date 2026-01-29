<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add status to groups table if not exists
        if (!Schema::hasColumn('groups', 'status')) {
            Schema::table('groups', function (Blueprint $table) {
                $table->enum('status', ['active', 'suspended', 'deleted'])->default('active')->after('privacy');
            });
        }

        // Add admin_notes to reports table
        if (!Schema::hasColumn('reports', 'admin_notes')) {
            Schema::table('reports', function (Blueprint $table) {
                $table->text('admin_notes')->nullable()->after('status');
                $table->foreignId('resolved_by')->nullable()->after('admin_notes')->constrained('admins')->onDelete('set null');
                $table->timestamp('resolved_at')->nullable()->after('resolved_by');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('groups', 'status')) {
            Schema::table('groups', function (Blueprint $table) {
                $table->dropColumn('status');
            });
        }

        if (Schema::hasColumn('reports', 'admin_notes')) {
            Schema::table('reports', function (Blueprint $table) {
                $table->dropForeign(['resolved_by']);
                $table->dropColumn(['admin_notes', 'resolved_by', 'resolved_at']);
            });
        }
    }
};

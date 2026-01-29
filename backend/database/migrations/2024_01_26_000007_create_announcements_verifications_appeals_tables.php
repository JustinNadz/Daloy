<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Announcements table
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('content');
            $table->enum('type', ['info', 'warning', 'success', 'error'])->default('info');
            $table->enum('target', ['all', 'users', 'verified', 'new'])->default('all');
            $table->boolean('is_active')->default(true);
            $table->boolean('is_dismissible')->default(true);
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->foreignId('created_by')->constrained('admins')->onDelete('cascade');
            $table->timestamps();
        });

        // Verification requests table
        Schema::create('verification_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('full_name');
            $table->string('category'); // influencer, brand, public_figure, etc.
            $table->text('reason');
            $table->json('documents')->nullable(); // uploaded verification documents
            $table->string('website_url')->nullable();
            $table->string('social_links')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('admin_notes')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('admins')->onDelete('set null');
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });

        // Appeals table
        Schema::create('appeals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('appeal_type'); // suspension, post_removal, account_deletion
            $table->string('related_type')->nullable(); // Post, Comment, etc.
            $table->unsignedBigInteger('related_id')->nullable();
            $table->text('reason');
            $table->text('explanation');
            $table->enum('status', ['pending', 'approved', 'rejected', 'under_review'])->default('pending');
            $table->text('admin_response')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('admins')->onDelete('set null');
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });

        // Add hashtag banning columns if not exists
        if (!Schema::hasColumn('hashtags', 'is_banned')) {
            Schema::table('hashtags', function (Blueprint $table) {
                $table->boolean('is_banned')->default(false);
                $table->timestamp('banned_at')->nullable();
                $table->string('ban_reason')->nullable();
            });
        }

        // Add is_hidden to posts if not exists
        if (!Schema::hasColumn('posts', 'is_hidden')) {
            Schema::table('posts', function (Blueprint $table) {
                $table->boolean('is_hidden')->default(false);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('appeals');
        Schema::dropIfExists('verification_requests');
        Schema::dropIfExists('announcements');

        if (Schema::hasColumn('hashtags', 'is_banned')) {
            Schema::table('hashtags', function (Blueprint $table) {
                $table->dropColumn(['is_banned', 'banned_at', 'ban_reason']);
            });
        }

        if (Schema::hasColumn('posts', 'is_hidden')) {
            Schema::table('posts', function (Blueprint $table) {
                $table->dropColumn('is_hidden');
            });
        }
    }
};

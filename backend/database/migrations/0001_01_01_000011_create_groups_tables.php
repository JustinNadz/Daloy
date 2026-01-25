<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('groups', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('avatar')->nullable();
            $table->string('cover_photo')->nullable();
            $table->enum('privacy', ['public', 'private', 'secret'])->default('public');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->unsignedInteger('members_count')->default(0);
            $table->unsignedInteger('posts_count')->default(0);
            $table->json('rules')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index('slug');
            $table->index('privacy');
            $table->index('created_by');
            $table->fullText(['name', 'description']);
        });

        Schema::create('group_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('role', ['owner', 'admin', 'moderator', 'member'])->default('member');
            $table->enum('status', ['pending', 'approved', 'rejected', 'banned'])->default('approved');
            $table->timestamp('joined_at')->useCurrent();
            $table->timestamps();

            $table->unique(['group_id', 'user_id']);
            $table->index('role');
            $table->index('status');
        });

        // Group posts (separate from main posts for better organization)
        Schema::create('group_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->constrained()->onDelete('cascade');
            $table->foreignId('post_id')->constrained()->onDelete('cascade');
            $table->boolean('is_pinned')->default(false);
            $table->boolean('is_announcement')->default(false);
            $table->timestamps();

            $table->unique(['group_id', 'post_id']);
        });

        // Group invitations
        Schema::create('group_invitations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->constrained()->onDelete('cascade');
            $table->foreignId('inviter_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('invitee_id')->constrained('users')->onDelete('cascade');
            $table->enum('status', ['pending', 'accepted', 'declined'])->default('pending');
            $table->text('message')->nullable();
            $table->timestamps();

            $table->unique(['group_id', 'invitee_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('group_invitations');
        Schema::dropIfExists('group_posts');
        Schema::dropIfExists('group_members');
        Schema::dropIfExists('groups');
    }
};

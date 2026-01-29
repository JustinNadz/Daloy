<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('moderation_actions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admin_id')->constrained('admins')->onDelete('cascade');
            $table->enum('action_type', ['delete_post', 'delete_comment', 'ban_user', 'suspend_user', 'warn_user', 'unsuspend_user', 'verify_user', 'unverify_user', 'delete_group', 'suspend_group', 'delete_event', 'hide_content', 'restore_content']);
            $table->string('target_type'); // user, post, comment, group, event
            $table->unsignedBigInteger('target_id');
            $table->text('reason')->nullable();
            $table->timestamps();

            $table->index(['target_type', 'target_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('moderation_actions');
    }
};

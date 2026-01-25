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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // recipient
            $table->foreignId('actor_id')->nullable()->constrained('users')->onDelete('cascade'); // who triggered
            $table->enum('type', [
                'like',
                'comment',
                'follow',
                'follow_request',
                'mention',
                'repost',
                'quote',
                'message',
                'group_invite',
                'group_join_request',
                'group_post',
                'system'
            ]);
            $table->morphs('notifiable'); // post, comment, follow, message, etc.
            $table->text('message')->nullable();
            $table->json('data')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('actor_id');
            $table->index('type');
            $table->index('read_at');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};

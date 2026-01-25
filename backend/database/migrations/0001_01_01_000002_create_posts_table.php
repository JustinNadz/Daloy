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
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->text('content');
            $table->enum('privacy', ['public', 'followers', 'private'])->default('public');
            $table->foreignId('parent_id')->nullable()->constrained('posts')->onDelete('cascade');
            $table->foreignId('original_post_id')->nullable()->constrained('posts')->onDelete('set null');
            $table->foreignId('quoted_post_id')->nullable()->constrained('posts')->onDelete('set null');
            $table->boolean('is_repost')->default(false);
            $table->boolean('is_pinned')->default(false);
            $table->unsignedInteger('likes_count')->default(0);
            $table->unsignedInteger('comments_count')->default(0);
            $table->unsignedInteger('reposts_count')->default(0);
            $table->unsignedInteger('views_count')->default(0);
            $table->unsignedInteger('bookmarks_count')->default(0);
            $table->boolean('is_edited')->default(false);
            $table->timestamp('edited_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('user_id');
            $table->index('parent_id');
            $table->index('privacy');
            $table->index('created_at');
            $table->index('is_pinned');
            $table->fullText('content');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};

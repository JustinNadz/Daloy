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
        Schema::create('blocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('blocker_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('blocked_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['blocker_id', 'blocked_id']);
            $table->index('blocker_id');
            $table->index('blocked_id');
        });

        Schema::create('mutes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('muted_user_id')->constrained('users')->onDelete('cascade');
            $table->timestamp('expires_at')->nullable(); // null = permanent
            $table->timestamps();

            $table->unique(['user_id', 'muted_user_id']);
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mutes');
        Schema::dropIfExists('blocks');
    }
};

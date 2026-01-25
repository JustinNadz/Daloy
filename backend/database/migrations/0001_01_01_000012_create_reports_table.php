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
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reporter_id')->constrained('users')->onDelete('cascade');
            $table->morphs('reportable'); // user, post, comment, message, group
            $table->enum('reason', [
                'spam',
                'harassment',
                'hate_speech',
                'violence',
                'nudity',
                'false_information',
                'copyright',
                'impersonation',
                'self_harm',
                'illegal',
                'other'
            ]);
            $table->text('description')->nullable();
            $table->json('evidence')->nullable(); // screenshots, links, etc.
            $table->enum('status', ['pending', 'reviewing', 'resolved', 'dismissed'])->default('pending');
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->text('resolution_notes')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->index('reason');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};

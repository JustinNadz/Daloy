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
        Schema::create('media', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->morphs('mediable'); // post, message, group, etc.
            $table->enum('type', ['image', 'video', 'gif', 'document']);
            $table->string('filename');
            $table->string('original_filename');
            $table->string('path');
            $table->string('url');
            $table->string('thumbnail_url')->nullable();
            $table->string('mime_type');
            $table->unsignedBigInteger('size'); // in bytes
            $table->unsignedInteger('width')->nullable();
            $table->unsignedInteger('height')->nullable();
            $table->unsignedInteger('duration')->nullable(); // for videos, in seconds
            $table->text('alt_text')->nullable();
            $table->unsignedInteger('order')->default(0);
            $table->timestamps();

            $table->index('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('media');
    }
};

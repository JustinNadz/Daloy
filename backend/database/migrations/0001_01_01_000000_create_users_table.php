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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('username')->unique();
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('display_name');
            $table->text('bio')->nullable();
            $table->string('avatar')->nullable();
            $table->string('cover_photo')->nullable();
            $table->string('location')->nullable();
            $table->string('website')->nullable();
            $table->date('birthdate')->nullable();
            $table->enum('privacy', ['public', 'private'])->default('public');
            $table->boolean('is_verified')->default(false);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_suspended')->default(false);
            $table->timestamp('suspended_until')->nullable();
            $table->string('suspension_reason')->nullable();
            $table->timestamp('last_active_at')->nullable();
            $table->string('remember_token', 100)->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('username');
            $table->index('email');
            $table->index('is_active');
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
    }
};

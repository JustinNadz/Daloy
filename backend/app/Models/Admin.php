<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Admin extends Authenticatable
{
    use HasApiTokens, HasFactory, SoftDeletes;

    protected $fillable = [
        'username',
        'email',
        'password',
        'name',
        'avatar',
        'role',
        'permissions',
        'is_active',
        'last_login_at',
        'last_login_ip',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'permissions' => 'array',
        'is_active' => 'boolean',
        'last_login_at' => 'datetime',
    ];

    public function logs()
    {
        return $this->hasMany(AdminLog::class);
    }

    public function reviewedReports()
    {
        return $this->hasMany(Report::class, 'reviewed_by');
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin';
    }

    public function isAdmin(): bool
    {
        return in_array($this->role, ['super_admin', 'admin']);
    }

    public function isModerator(): bool
    {
        return in_array($this->role, ['super_admin', 'admin', 'moderator']);
    }

    public function hasPermission(string $permission): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        return in_array($permission, $this->permissions ?? []);
    }

    public function logAction(string $action, string $module = null, $loggable = null, array $oldValues = null, array $newValues = null): AdminLog
    {
        return $this->logs()->create([
            'action' => $action,
            'module' => $module,
            'loggable_type' => $loggable ? get_class($loggable) : null,
            'loggable_id' => $loggable?->id,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}

<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AccountDeletionScheduledNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $deletionDate = now()->addDays(30)->format('F j, Y');
        $cancelUrl = config('app.frontend_url') . '/settings';

        return (new MailMessage)
            ->subject('Account Deletion Scheduled - Daloy')
            ->greeting('Hello ' . $notifiable->username . ',')
            ->line('We have received your request to delete your Daloy account.')
            ->line('Your account is scheduled for permanent deletion on **' . $deletionDate . '**.')
            ->line('**30-Day Grace Period:**')
            ->line('You have 30 days to change your mind. If you want to keep your account, simply log in and cancel the deletion from your Settings page.')
            ->action('Cancel Deletion', $cancelUrl)
            ->line('**What happens after 30 days:**')
            ->line('• Your account will be permanently deleted')
            ->line('• All your posts will be anonymized or removed')
            ->line('• Your messages will be deleted')
            ->line('• All your data will be removed from our servers')
            ->line('If you did not request this deletion, please log in immediately and cancel it.')
            ->salutation('Best regards, The Daloy Team');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}

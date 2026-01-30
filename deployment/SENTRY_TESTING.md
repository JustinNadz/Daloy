# Sentry Error Tracking - Test Guide

## 🧪 Testing Sentry Integration

### Backend Testing (Laravel)

#### 1. Test Error Capture

Create a test endpoint:
```bash
php artisan make:controller TestController
```

Add to `routes/web.php`:
```php
Route::get('/test-sentry', function () {
    throw new \Exception('Sentry test error - Backend is working!');
});
```

Test it:
```bash
curl https://yourdomain.com/test-sentry
```

**Expected:** Error should appear in Sentry dashboard within seconds.

---

#### 2. Test Manual Error Logging

```php
use Sentry\Laravel\Integration;

try {
    throw new \Exception('Test exception');
} catch (\Exception $e) {
    app('sentry')->captureException($e);
}
```

---

#### 3. Test Breadcrumbs

```php
use Sentry\State\Scope;

\Sentry\configureScope(function (Scope $scope): void {
    $scope->setUser(['email' => 'test@example.com']);
    $scope->setTag('environment', 'testing');
});

throw new \Exception('Test with context');
```

---

### Frontend Testing (React)

#### 1. Test Error Boundary

Add to any component:
```jsx
<button onClick={() => {
    throw new Error('Sentry test error - Frontend is working!');
}}>
    Test Sentry
</button>
```

---

#### 2. Test Manual Capture

```javascript
import * as Sentry from '@sentry/react';

try {
    throw new Error('Test exception');
} catch (error) {
    Sentry.captureException(error);
}
```

---

#### 3. Test Performance Monitoring

```javascript
import * as Sentry from '@sentry/react';

const transaction = Sentry.startTransaction({
    name: 'Test Transaction',
});

// Do some work
setTimeout(() => {
    transaction.finish();
}, 1000);
```

---

## ✅ Verification Checklist

### Sentry Dashboard (sentry.io)

- [ ] New issues appear in dashboard
- [ ] Stack traces are complete
- [ ] Source maps working (frontend)
- [ ] User context captured
- [ ] Environment tags correct
- [ ] Performance transactions recorded

### Error Details Should Include:

**Context:**
- [ ] URL/endpoint
- [ ] User information
- [ ] Browser/device (frontend)
- [ ] Request data

**Technical:**
- [ ] Full stack trace
- [ ] Line numbers correct
- [ ] File paths mapped
- [ ] Variables captured

---

## 🔧 Troubleshooting

**Errors not appearing:**
1. Check DSN is correct in `.env`
2. Verify Sentry is initialized
3. Check network requests (browser DevTools)
4. Verify environment is not filtering errors

**Stack traces incomplete:**
1. Upload source maps (frontend)
2. Check file paths in Sentry
3. Verify debug mode settings

**Rate limiting:**
- Sentry free tier: 5,000 errors/month
- Upgrade if hitting limits

---

## 📊 Monitoring Best Practices

### 1. Set Up Alerts

In Sentry dashboard:
- Go to project settings → Alerts
- Create alert: "Issue is first seen"
- Set notification method (email, Slack)

### 2. Filter Noise

Ignore known errors:
```javascript
Sentry.init({
    ignoreErrors: [
        'ResizeObserver loop limit exceeded',
        'Non-Error promise rejection',
    ],
});
```

### 3. Sample Rates

For production:
```javascript
Sentry.init({
    tracesSampleRate: 0.1, // 10% of transactions
    replaysSessionSampleRate: 0.1, // 10% of sessions
});
```

---

## 🎯 Success Criteria

**Sentry is working if:**
- ✅ Test errors appear in dashboard
- ✅ Stack traces are readable
- ✅ Context information captured
- ✅ Alerts firing correctly
- ✅ Performance data recorded

---

## 🚀 Next Steps

1. **Configure alerts** for critical errors
2. **Set up integrations** (Slack, email)
3. **Review errors daily** for first week
4. **Tune filters** to reduce noise
5. **Monitor performance** trends

---

## 📝 Sentry Dashboard

Access: https://sentry.io/organizations/your-org/projects/

**Key Metrics to Monitor:**
- Error frequency
- User impact
- Performance trends
- Release health

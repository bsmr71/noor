<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Mobile-Exclusive API Lock
    |--------------------------------------------------------------------------
    | When enabled, all /api/v1/* endpoints reject browsers, Web Apps, Postman,
    | cURL, and third-party apps. Only signed requests from the official Noor
    | React Native (Android/iOS) application are accepted.
    */
    'exclusive' => (bool) env('API_MOBILE_EXCLUSIVE', true),

    'app_id' => env('MOBILE_APP_ID', 'com.noor.islamicapp'),

    'secret' => env(
        'MOBILE_APP_SECRET',
        'noor_mobile_hmac_9f8e7d6c5b4a39281726354453627180_prod_v1'
    ),

    // Maximum allowed clock skew / replay window in seconds (default: 5 minutes)
    'max_timestamp_drift' => (int) env('MOBILE_API_MAX_DRIFT', 300),
];


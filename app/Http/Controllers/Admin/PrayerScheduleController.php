<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PrayerScheduleController extends Controller
{
    public function index()
    {
        return view('admin.prayer_schedule');
    }
}


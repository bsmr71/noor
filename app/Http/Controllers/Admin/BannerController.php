<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use Illuminate\Http\Request;

class BannerController extends Controller
{
    public function index()
    {
        $banners = AppSetting::get('banners', []);
        return view('admin.banners', compact('banners'));
    }
}


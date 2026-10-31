<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class QuranController extends Controller
{
    public function index()
    {
        return view('admin.quran');
    }

    public function editor()
    {
        return view('admin.quran_editor');
    }
}


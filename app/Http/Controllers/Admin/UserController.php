<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        if ($request->filled('role') && $request->role !== 'all') {
            $query->where('role', $request->role);
            if ($request->role === 'premium') {
                $query->where('is_premium', true)->where(function ($q) {
                    $q->whereNull('premium_expires_at')->orWhere('premium_expires_at', '>', now());
                });
            } else {
                $query->where('role', $request->role);
            }
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->orderBy('id', 'desc')->get();

        return view('admin.users', compact('users'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|string|in:admin,jamaah,ustadz',
            'bio' => 'nullable|string|max:500',
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'bio' => $validated['bio'] ?? 'Jamaah terdaftar aplikasi Noor.',
            'avatar' => 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        ]);

        return redirect()->route('admin.users')->with('success', "Pengguna {$validated['name']} berhasil ditambahkan!");
    }

    public function updateRole(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $role = $request->input('role', 'jamaah');
        $user->role = $role;
        $user->save();

        return redirect()->route('admin.users')->with('success', "Role {$user->name} berhasil diubah menjadi {$role}!");
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        if ($user->email === 'admin@noor.app') {
            return redirect()->route('admin.users')->with('error', 'Super Admin utama tidak dapat dihapus.');
        }

        $name = $user->name;
        $user->delete();

        return redirect()->route('admin.users')->with('success', "Pengguna {$name} berhasil dihapus.");
    }
}


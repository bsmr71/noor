<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\AppSetting;
use App\Models\Campaign;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Super Admin User
        User::updateOrCreate(
            ['email' => 'admin@noor.app'],
            [
                'name' => 'Administrator Noor',
                'password' => Hash::make('password'),
                'avatar' => 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
                'bio' => 'Super Administrator Noor Islamic Ecosystem Console.',
                'role' => 'admin',
            ]
        );

        // 2. Official Jamaah User
        User::updateOrCreate(
            ['email' => 'ahmad.fauzi@noor.app'],
            [
                'name' => 'Ahmad Fauzi',
                'password' => Hash::make('password'),
                'avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
                'bio' => 'Senantiasa berikhtiar istiqomah dalam tilawah & doa harian.',
                'role' => 'jamaah',
            ]
        );

        // 2. Default App Settings
        AppSetting::set('spiritual_prompt', '✨ Perbanyak sholawat & tilawah Surah Al-Kahf di hari mulia ini.');
        AppSetting::set('announcement_bar', 'Kemenag RI: Hilal 1 Ramadan 1446 H terpantau di 120 titik hisab rukyat.');
        AppSetting::set('kemenag_sync_status', 'Aktif & Kalibrasi Presisi (Bimas Islam RI)');
        AppSetting::set('prayer_offset_minutes', 0);
        AppSetting::set('default_city', 'Jakarta');

        // 4. Default Banners
        AppSetting::set('banners', [
            [
                'id' => 1,
                'title' => 'Umrah Syahdu Akhir Ramadhan 1445 H',
                'tag' => 'Pilihan Jamaah',
                'badge' => 'Early Bird Hemat 2.5 Juta',
                'verified' => 'Disponsori • Terverifikasi Kemenag RI No. 892/2022',
                'detail1' => 'Direct Saudia • Hotel Bintang 5',
                'detail2' => 'Depan Pelataran',
                'oldPrice' => 'Rp 34.500.000',
                'price' => 'Rp 31.900.000',
                'btnText' => 'Lihat Paket Umrah',
                'btnIcon' => 'arrow-forward',
                'image' => 'https://lh3.googleusercontent.com/aida-public/AB6AXuAMnj95EzLYjx-SPWjYmZ5PR_8eTxm7D2JqvL3oNvzabNi9-lkZvwNYVdb-qtX6kdAA36hqwdRDxhw0F00a3uLArlQxfrRhOTVumBuRz-3VcIcw4mg-WXQE80uhMl5HJyz1ELA_Lv8AEDQjHIz3QOTLV_cSciDJgJpTOD3ukifmWCGZM5PtWecKP4s6jmYpBgXv00hy_JrLq7TVCx3rD_O96c9jLLB6w7ewUhcGr2Q'
            ],
            [
                'id' => 2,
                'title' => "Wakaf 10.000 Al-Qur'an Pelosok Nusantara",
                'tag' => 'Program Sedekah Jariyah',
                'badge' => 'Amanah BWI',
                'verified' => 'Disponsori • Yayasan Wakaf Terdaftar BWI',
                'detail1' => 'Distribusi: Maluku & Nusa Tenggara',
                'detail2' => 'Mulai Rp 10.000 / Mushaf',
                'oldPrice' => 'Infaq Mulai',
                'price' => 'Rp 10.000',
                'btnText' => 'Tunaikan Wakaf',
                'btnIcon' => 'favorite',
                'image' => 'https://lh3.googleusercontent.com/aida-public/AB6AXuAH0MkW1bf-vCNPYdhshT419cCOqMO6gI3oTufQb4hwg4-emu0nN3TMbTzV18sMMXDBCKVDxejZ_MJQyCKTKINv-2-6KJQMdiBpTAgOWaCtWf5BlzIkWGaETDGHmuqDwUhtGjSSzpqrFfhS_Ai8sWFgqChm3NEGb1eYvrm5knIqqwzBdfOSZqYTqh0Z7dR-h7gWtImpafP3asyHsUUknUenBIZrFHW5wvOizQ6_B1o'
            ],
            [
                'id' => 3,
                'title' => 'Ensiklopedia Akhlak & Sirah Nabawiyah',
                'tag' => 'Literasi Islami',
                'badge' => 'Diskon 30%',
                'verified' => 'Disponsori • Penerbit Syiar Sahabat',
                'detail1' => 'Edisi Eksklusif 3 Jilid Lengkap',
                'detail2' => 'Gratis Ongkir Se-Jawa',
                'oldPrice' => 'Rp 450.000',
                'price' => 'Rp 315.000',
                'btnText' => 'Beli Sekarang',
                'btnIcon' => 'shopping-bag',
                'image' => 'https://lh3.googleusercontent.com/aida-public/AB6AXuC1wdUU-JTenP_p92PmY2fQISNjFfAx5nKTrzp6amT8EEZMTfaxVQICmhPWGNCxcdtFBuzLBKexVsngGcheiJCR71o8o7O39ug3f5RzV7c5bcxni7CUI_xnZXa2tcxSqupAOObkxL95AAEySlOQa0tB63r6nJoYA2VAgvfQ-ETjeWusSBPRNcjla1Y3_B9Erc8CCxeu-czGncpDrSzmC-9xy8_S6XJqZnnH9BWRiGM'
            ],
            [
                'id' => 4,
                'title' => 'Siapkan Qurban Terbaik Dzulhijjah',
                'tag' => 'Tabungan Qurban',
                'badge' => 'Cicilan 0%',
                'verified' => 'Disponsori • Lembaga Qurban Nasional',
                'detail1' => 'Kambing Premium Berbobot 30kg+',
                'detail2' => 'Sesuai Syariat',
                'oldPrice' => 'Mulai Dari',
                'price' => 'Rp 1.950.000',
                'btnText' => 'Buka Tabungan',
                'btnIcon' => 'savings',
                'image' => 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTItRSefM164ppbvssUWodNfrlD7Jn7KnK7twGaztO7LLrbh_kCjqY-Zb6NlJ5NTkLXkEgdMeMuNegtPtXK-RNwPtfnZKGG0VXKqmjNiYyO_VKA2z6CUDhXIws2CrmKIUpz2hfa0tTODW8YD4rD9QPQgQmYLHQT1vUg9fzI6mj9oyY2zhVWf3DFu5fn25peoa41m5dEOfj5kf8FCMcxZUHbQhAvfB6HHWau9HDFF0'
            ]
        ]);

        // 5. Official Donation Campaigns (Clean production state: 0 collected, 0 donors)
        Campaign::updateOrCreate(
            ['slug' => 'wakaf-quran-pelosok-nusantara'],
            [
                'title' => "Wakaf 10.000 Al-Qur'an Pelosok Nusantara",
                'category' => 'Wakaf Mushaf',
                'partner' => 'Yayasan Wakaf BWI',
                'target_amount' => 500000000,
                'collected_amount' => 0,
                'donor_count' => 0,
                'status' => 'active',
                'badge' => 'Unggulan',
                'days_left' => 30,
                'image_url' => 'https://lh3.googleusercontent.com/aida-public/AB6AXuAH0MkW1bf-vCNPYdhshT419cCOqMO6gI3oTufQb4hwg4-emu0nN3TMbTzV18sMMXDBCKVDxejZ_MJQyCKTKINv-2-6KJQMdiBpTAgOWaCtWf5BlzIkWGaETDGHmuqDwUhtGjSSzpqrFfhS_Ai8sWFgqChm3NEGb1eYvrm5knIqqwzBdfOSZqYTqh0Z7dR-h7gWtImpafP3asyHsUUknUenBIZrFHW5wvOizQ6_B1o',
                'description' => 'Program penyaluran mushaf Al-Qur\'an standar Kementerian Agama RI untuk santri madrasah dan mushalla terpencil di pelosok Maluku dan Papua.',
            ]
        );

        Campaign::updateOrCreate(
            ['slug' => 'sedekah-subuh-berkah'],
            [
                'title' => 'Sedekah Subuh Berkah Berkelanjutan',
                'category' => 'Sedekah Harian',
                'partner' => 'Dompet Dhuafa',
                'target_amount' => 250000000,
                'collected_amount' => 0,
                'donor_count' => 0,
                'status' => 'active',
                'badge' => 'Rutin',
                'days_left' => 60,
                'image_url' => 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
                'description' => 'Malaikat mendoakan kebaikan bagi setiap hamba yang bersedekah di waktu subuh. Salurkan rezeki terbaik untuk mustahiq dan dhuafa dhuha.',
            ]
        );

        Campaign::updateOrCreate(
            ['slug' => 'zakat-maal-fitrah-1445h'],
            [
                'title' => 'Zakat Maal & Fitrah Pembersih Harta 1445 H',
                'category' => 'Zakat Fardhu',
                'partner' => 'BAZNAS RI Pusat',
                'target_amount' => 400000000,
                'collected_amount' => 0,
                'donor_count' => 0,
                'status' => 'active',
                'badge' => 'Fardhu',
                'days_left' => 30,
                'image_url' => 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80',
                'description' => 'Pembersih harta bagi muzakki yang telah mencapai nishab & haul, disalurkan secara amanah, akuntabel, dan transparan langsung ke 8 golongan asnaf.',
            ]
        );

        Campaign::updateOrCreate(
            ['slug' => 'santunan-yatim-dhuafa'],
            [
                'title' => 'Paket Ifthar & Santunan Yatim Dhuafa',
                'category' => 'Santunan',
                'partner' => 'Rumah Yatim',
                'target_amount' => 100000000,
                'collected_amount' => 0,
                'donor_count' => 0,
                'status' => 'active',
                'badge' => 'Sosial',
                'days_left' => 30,
                'image_url' => 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80',
                'description' => 'Memberikan kebahagiaan dan masa depan gemilang bagi ribuan anak yatim piatu melalui beasiswa pendidikan dan paket nutrisi syariah.',
            ]
        );
    }
}

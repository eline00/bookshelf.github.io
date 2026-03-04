-- Books table
CREATE TABLE books (
  id           BIGINT PRIMARY KEY,
  title        TEXT NOT NULL,
  author       TEXT NOT NULL,
  year         INTEGER NOT NULL,
  rating       INTEGER NOT NULL,
  pages        INTEGER NOT NULL,
  genre        TEXT NOT NULL,
  date         TEXT NOT NULL,
  date_started TEXT NOT NULL,
  date_pub     TEXT NOT NULL,
  read_count   INTEGER NOT NULL DEFAULT 1,
  avg_rating   NUMERIC(3,2) NOT NULL,
  notes        TEXT NOT NULL DEFAULT 'None',
  cover_color  TEXT
);

-- Yearly reading goals
CREATE TABLE yearly_goals (
  year INTEGER PRIMARY KEY,
  goal INTEGER NOT NULL
);

-- Enable Row Level Security
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE yearly_goals ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON books FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON yearly_goals FOR SELECT USING (true);

-- Seed books
INSERT INTO books (id, title, author, year, rating, pages, genre, date, date_started, date_pub, read_count, avg_rating, notes, cover_color) VALUES
-- 2024 Books
(6942935033, 'A Court of Mist and Fury', 'Sarah J. Maas', 2024, 5, 626, 'Romantasy', 'Oct 10, 2024', 'Oct 05, 2024', 'May 03, 2016', 2, 4.64, 'None', '#1a1a3e'),
(50659472, 'A Court of Wings and Ruin', 'Sarah J. Maas', 2024, 4, 699, 'Romantasy', 'Oct 14, 2024', 'Oct 09, 2024', 'May 02, 2017', 1, 4.46, 'None', '#8B4513'),
(50659471, 'A Court of Frost and Starlight', 'Sarah J. Maas', 2024, 3, 272, 'Romantasy', 'Oct 16, 2024', 'Oct 14, 2024', 'May 21, 2019', 1, 3.72, 'None', '#2F4F4F'),
(53138095, 'A Court of Silver Flames', 'Sarah J. Maas', 2024, 5, 757, 'Romantasy', 'Oct 18, 2024', 'Oct 16, 2024', 'Feb 16, 2021', 1, 4.45, 'None', '#800020'),
(61431922, 'Fourth Wing', 'Rebecca Yarros', 2024, 5, 517, 'Romantasy', 'Oct 20, 2024', 'Oct 18, 2024', 'May 02, 2023', 2, 4.57, 'None', '#1a1a1a'),
(202533930, 'Iron Flame', 'Rebecca Yarros', 2024, 4, 623, 'Romantasy', 'Oct 31, 2024', 'Oct 21, 2024', 'Nov 07, 2023', 2, 4.35, 'None', '#8B4513'),
(76703559, 'Throne of Glass', 'Sarah J. Maas', 2024, 3, 406, 'Fantasy', 'Nov 10, 2024', 'Nov 03, 2024', 'Aug 07, 2012', 1, 4.18, 'None', '#2d5a27'),
(76705490, 'Crown of Midnight', 'Sarah J. Maas', 2024, 3, 420, 'Fantasy', 'Nov 14, 2024', 'Nov 10, 2024', 'Aug 15, 2013', 1, 4.36, 'None', '#1a1a3e'),
(76706470, 'Heir of Fire', 'Sarah J. Maas', 2024, 4, 576, 'Fantasy', 'Nov 18, 2024', 'Nov 14, 2024', 'Sep 02, 2014', 1, 4.45, 'None', '#8B4513'),
(126062562, 'The Assassin''s Blade', 'Sarah J. Maas', 2024, 3, 451, 'Fantasy', 'Nov 21, 2024', 'Nov 18, 2024', 'Mar 04, 2014', 1, 4.20, 'None', '#2d2d2d'),
(76707900, 'Queen of Shadows', 'Sarah J. Maas', 2024, 4, 648, 'Fantasy', 'Nov 25, 2024', 'Nov 21, 2024', 'Sep 01, 2015', 1, 4.62, 'None', '#4a0e4e'),
(76713323, 'Empire of Storms', 'Sarah J. Maas', 2024, 5, 733, 'Fantasy', 'Nov 30, 2024', 'Nov 25, 2024', 'Sep 06, 2016', 1, 4.63, 'None', '#1a3a5c'),
(76714487, 'Tower of Dawn', 'Sarah J. Maas', 2024, 5, 688, 'Fantasy', 'Nov 30, 2024', 'Nov 25, 2024', 'Sep 05, 2017', 1, 4.28, 'None', '#c4a35a'),
(76715522, 'Kingdom of Ash', 'Sarah J. Maas', 2024, 5, 984, 'Fantasy', 'Dec 05, 2024', 'Nov 30, 2024', 'Oct 23, 2018', 1, 4.71, 'None', '#1a1a1a'),
(217536270, 'Quicksilver', 'Callie Hart', 2024, 5, 624, 'Romantasy', 'Dec 26, 2024', 'Dec 22, 2024', 'Jun 04, 2024', 1, 4.34, 'None', '#c0c0c0'),

-- 2025 Books
(44778083, 'House of Earth and Blood', 'Sarah J. Maas', 2025, 3, 803, 'Romantasy', 'Jan 07, 2025', 'Dec 27, 2024', 'Mar 03, 2020', 1, 4.25, 'None', '#8B0000'),
(40132775, 'House of Sky and Breath', 'Sarah J. Maas', 2025, 4, 805, 'Romantasy', 'Jan 15, 2025', 'Jan 07, 2025', 'Feb 15, 2022', 1, 4.31, 'None', '#1e3a5f'),
(52857700, 'House of Flame and Shadow', 'Sarah J. Maas', 2025, 5, 835, 'Romantasy', 'Jan 26, 2025', 'Jan 15, 2025', 'Jan 30, 2024', 1, 4.18, 'None', '#4a0e4e'),
(61431923, 'Fourth Wing', 'Rebecca Yarros', 2025, 5, 517, 'Romantasy', 'Feb 01, 2025', 'Jan 26, 2025', 'May 02, 2023', 2, 4.57, 'Re-read', '#1a1a1a'),
(202533931, 'Iron Flame', 'Rebecca Yarros', 2025, 4, 623, 'Romantasy', 'Feb 10, 2025', 'Feb 01, 2025', 'Nov 07, 2023', 2, 4.35, 'Re-read', '#8B4513'),
(209439446, 'Onyx Storm', 'Rebecca Yarros', 2025, 4, 544, 'Romantasy', 'Feb 18, 2025', 'Feb 10, 2025', 'Jan 21, 2025', 1, 4.21, 'None', '#0a0a0a'),
(202507554, 'When the Moon Hatched', 'Sarah A. Parker', 2025, 3, 718, 'Romantasy', 'Mar 06, 2025', 'Feb 19, 2025', 'Nov 24, 2024', 1, 3.99, 'None', '#2d3436'),
(60039506, 'Manacled', 'SenLinYu', 2025, 4, 945, 'Fanfic', 'Mar 15, 2025', 'Mar 04, 2025', 'Aug 19, 2019', 2, 4.63, 'Re-read', '#1a1a1a'),
(58340706, 'One Dark Window', 'Rachel Gillig', 2025, 5, 432, 'Romantasy', 'Mar 18, 2025', 'Mar 16, 2025', 'Sep 27, 2022', 1, 4.27, 'None', '#1a1a2e'),
(63910262, 'Two Twisted Crowns', 'Rachel Gillig', 2025, 5, 437, 'Romantasy', 'Mar 23, 2025', 'Mar 19, 2025', 'Oct 17, 2023', 1, 4.39, 'None', '#2d1f3d'),
(58763686, 'Haunting Adeline', 'H.D. Carlton', 2025, 2, 583, 'Dark Romance', 'Mar 28, 2025', 'Mar 23, 2025', 'Aug 12, 2021', 1, 3.94, 'None', '#1a1a1a'),
(59050133, 'Hunting Adeline', 'H.D. Carlton', 2025, 2, 684, 'Dark Romance', 'Apr 09, 2025', 'Mar 28, 2025', 'Jan 25, 2022', 1, 4.07, 'None', '#8B0000'),
(60714999, 'The Serpent and the Wings of Night', 'Carissa Broadbent', 2025, 5, 504, 'Romantasy', 'Apr 12, 2025', 'Apr 10, 2025', 'Aug 16, 2022', 1, 4.27, 'None', '#0d1b2a'),
(217454286, 'The Ashes and the Star-Cursed King', 'Carissa Broadbent', 2025, 4, 737, 'Romantasy', 'Apr 25, 2025', 'Apr 13, 2025', 'Apr 14, 2023', 1, 4.07, 'None', '#3d1c02'),
(7406308212, 'The Book of Azrael', 'Amber V. Nicole', 2025, 5, 572, 'Romantasy', 'May 01, 2025', 'Apr 26, 2025', 'Apr 26, 2022', 1, 4.12, 'None', '#0d1b2a'),
(7484619744, 'The Throne of Broken Gods', 'Amber V. Nicole', 2025, 5, 728, 'Romantasy', 'May 08, 2025', 'May 01, 2025', 'May 18, 2023', 1, 4.21, 'None', '#c4a35a'),
(7484619994, 'The Dawn of the Cursed Queen', 'Amber V. Nicole', 2025, 5, 581, 'Romantasy', 'May 21, 2025', 'May 10, 2025', 'May 28, 2024', 1, 4.32, 'None', '#4a0e4e'),
(7623814621, 'Animal Farm', 'George Orwell', 2025, 5, 141, 'Fiction', 'Jun 03, 2025', 'Jun 01, 2025', 'Aug 17, 1945', 1, 4.01, 'None', '#90EE90'),
(6942919342, 'A Court of Thorns and Roses', 'Sarah J. Maas', 2025, 3, 419, 'Romantasy', 'Jun 24, 2025', 'Jun 22, 2025', 'May 05, 2015', 2, 4.16, 'Re-read', '#8B0000'),
(6942935034, 'A Court of Mist and Fury', 'Sarah J. Maas', 2025, 5, 626, 'Romantasy', 'Jun 30, 2025', 'Jun 25, 2025', 'May 03, 2016', 2, 4.64, 'Re-read', '#1a1a3e'),
(7406314349, 'Yellowface', 'R.F. Kuang', 2025, 3, 319, 'Fiction', 'Jul 04, 2025', 'Jul 01, 2025', 'May 16, 2023', 1, 3.93, 'None', '#FFD700'),
(7633325425, 'Heartless Hunter', 'Kristen Ciccarelli', 2025, 5, 406, 'Romantasy', 'Jul 10, 2025', 'Jul 05, 2025', 'Apr 30, 2024', 1, 4.15, 'None', '#8B0000'),
(7406309737, 'Rebel Witch', 'Kristen Ciccarelli', 2025, 5, 464, 'Romantasy', 'Jul 12, 2025', 'Jul 10, 2025', 'Feb 04, 2025', 1, 4.42, 'None', '#4a0e4e'),
(7406309075, 'The Awakening', 'Caroline Peckham', 2025, 5, 436, 'Romantasy', 'Jul 15, 2025', 'Jul 12, 2025', 'Aug 14, 2019', 1, 4.02, 'None', '#1a1a3e'),
(7772482866, 'Ruthless Fae', 'Caroline Peckham', 2025, 4, 475, 'Romantasy', 'Jul 20, 2025', 'Jul 15, 2025', 'Oct 31, 2019', 1, 4.15, 'None', '#4a0e4e'),
(7772483376, 'The Reckoning', 'Caroline Peckham', 2025, 5, 562, 'Romantasy', 'Jul 25, 2025', 'Jul 20, 2025', 'Jan 28, 2020', 1, 4.22, 'None', '#1a3a5c'),
(7772484327, 'Dark Fae', 'Caroline Peckham', 2025, 3, 536, 'Romantasy', 'Jul 28, 2025', 'Jul 25, 2025', 'Nov 30, 2019', 1, 4.21, 'None', '#1a1a2e'),
(7779097113, 'Savage Fae', 'Caroline Peckham', 2025, 2, 513, 'Romantasy', 'Jul 28, 2025', 'Jul 28, 2025', 'Jan 31, 2020', 1, 4.18, 'None', '#4a0e4e'),
(7797888957, 'Vicious Fae', 'Caroline Peckham', 2025, 2, 678, 'Romantasy', 'Aug 05, 2025', 'Jul 28, 2025', 'Feb 21, 2020', 1, 4.22, 'None', '#8B0000'),
(7830749722, 'Broken Fae', 'Caroline Peckham', 2025, 2, 664, 'Romantasy', 'Aug 14, 2025', 'Aug 04, 2025', 'Aug 31, 2020', 1, 4.27, 'None', '#2d2d2d'),
(7830750304, 'Warrior Fae', 'Caroline Peckham', 2025, 2, 680, 'Romantasy', 'Sep 19, 2025', 'Aug 14, 2025', 'Apr 30, 2021', 1, 4.28, 'None', '#3d1c02'),
(7955981318, 'Shadow Princess', 'Caroline Peckham', 2025, 4, 724, 'Romantasy', 'Sep 24, 2025', 'Sep 20, 2025', 'Jan 13, 2020', 1, 4.27, 'None', '#2d1f3d'),
(7955983836, 'Cursed Fates', 'Caroline Peckham', 2025, 4, 886, 'Romantasy', 'Sep 28, 2025', 'Sep 24, 2025', 'Dec 21, 2020', 1, 4.31, 'None', '#0d1b2a'),
(7955985284, 'Fated Throne', 'Caroline Peckham', 2025, 4, 823, 'Romantasy', 'Oct 07, 2025', 'Sep 28, 2025', 'Dec 25, 2020', 1, 4.32, 'None', '#c4a35a');

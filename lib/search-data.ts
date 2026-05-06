export interface SearchCollection {
  id: string
  name: string
  icon: string
  memberCount: number
}

export interface SearchUser {
  id: string
  name: string
  username: string
  avatar: string
  location?: string
}

export const searchCollections: SearchCollection[] = [
  { id: 'fender-fans', name: 'Fender Fans', icon: '🎸', memberCount: 4821 },
  { id: 'gibson-gang', name: 'Gibson Gang', icon: '🎸', memberCount: 3102 },
  { id: 'acoustic-corner', name: 'Acoustic Corner', icon: '🪕', memberCount: 1560 },
  { id: 'pedal-builders', name: 'Pedal Builders', icon: '🎛️', memberCount: 2103 },
  { id: 'vintage-vibes', name: 'Vintage Vibes', icon: '📻', memberCount: 3241 },
  { id: 'prs-players', name: 'PRS Players', icon: '🎸', memberCount: 987 },
  { id: 'shred-zone', name: 'Shred Zone', icon: '⚡', memberCount: 876 },
  { id: 'martin-fans', name: 'Martin Fans', icon: '🪕', memberCount: 2654 },
  { id: 'boutique-amps', name: 'Boutique Amps', icon: '🔊', memberCount: 1432 },
]

export const searchUsers: SearchUser[] = [
  { id: 'u1', name: 'John Smith', username: 'johnsmith', avatar: 'https://i.pravatar.cc/150?img=1', location: 'Brooklyn, NY' },
  { id: 'u2', name: 'Maria Garcia', username: 'maria_g', avatar: 'https://i.pravatar.cc/150?img=5', location: 'Austin, TX' },
  { id: 'u3', name: 'Tom Wilson', username: 'guitar_collector', avatar: 'https://i.pravatar.cc/150?img=3', location: 'Nashville, TN' },
  { id: 'u4', name: 'Sarah Chen', username: 'sarahc', avatar: 'https://i.pravatar.cc/150?img=10', location: 'Portland, OR' },
  { id: 'u5', name: 'David Park', username: 'dpark_music', avatar: 'https://i.pravatar.cc/150?img=6', location: 'Los Angeles, CA' },
  { id: 'u6', name: 'Lisa Johnson', username: 'lisaj', avatar: 'https://i.pravatar.cc/150?img=9', location: 'Chicago, IL' },
  { id: 'u7', name: 'Mike Torres', username: 'miket', avatar: 'https://i.pravatar.cc/150?img=7', location: 'Denver, CO' },
  { id: 'u8', name: 'Emily Davis', username: 'emilyd', avatar: 'https://i.pravatar.cc/150?img=12', location: 'Seattle, WA' },
  { id: 'u9', name: 'Carlos Ruiz', username: 'carlosr', avatar: 'https://i.pravatar.cc/150?img=15', location: 'Miami, FL' },
]

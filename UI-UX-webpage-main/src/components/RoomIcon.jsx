import {
  Sofa, BedDouble, ChefHat, Droplets, BookOpen,
  Dumbbell, Gamepad2, Leaf, Waves, Monitor, Car, Wind
} from 'lucide-react'

export const ROOM_ICONS = [
  { id: 'sofa',    icon: Sofa,      label: 'Living Room' },
  { id: 'bed',     icon: BedDouble, label: 'Bedroom' },
  { id: 'kitchen', icon: ChefHat,   label: 'Kitchen' },
  { id: 'shower',  icon: Droplets,  label: 'Bathroom' },
  { id: 'study',   icon: BookOpen,  label: 'Study' },
  { id: 'gym',     icon: Dumbbell,  label: 'Gym' },
  { id: 'game',    icon: Gamepad2,  label: 'Game Room' },
  { id: 'garden',  icon: Leaf,      label: 'Garden' },
  { id: 'bath',    icon: Waves,     label: 'Bathtub' },
  { id: 'office',  icon: Monitor,   label: 'Office' },
  { id: 'garage',  icon: Car,       label: 'Garage' },
  { id: 'laundry', icon: Wind,      label: 'Laundry' },
]

export default function RoomIcon({ iconId, size = 24, color = '#2d6a4f' }) {
  const found = ROOM_ICONS.find(ri => ri.id === iconId)
  if (found) {
    const Icon = found.icon
    return <Icon size={size} color={color} />
  }
  return <Sofa size={size} color={color} />
}
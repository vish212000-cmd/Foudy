import type { Meta, StoryObj } from '@storybook/react'
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/Avatar'
import { Badge } from '../components/ui/Badge'

// Avatar Stories
const avatarMeta: Meta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
}

export default avatarMeta
type Story = StoryObj<typeof Avatar>

export const WithImage: Story = {
  render: () => (
    <Avatar className="h-16 w-16">
      <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=alex" alt="Alex" />
      <AvatarFallback>A</AvatarFallback>
    </Avatar>
  ),
}

export const WithFallback: Story = {
  render: () => (
    <Avatar className="h-16 w-16">
      <AvatarFallback>JK</AvatarFallback>
    </Avatar>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      {['h-8 w-8', 'h-12 w-12', 'h-16 w-16', 'h-24 w-24'].map(size => (
        <Avatar key={size} className={size}>
          <AvatarFallback className="text-xs">U</AvatarFallback>
        </Avatar>
      ))}
    </div>
  ),
}

export const WithBadge: Story = {
  render: () => (
    <div className="relative inline-flex">
      <Avatar className="h-12 w-12">
        <AvatarFallback>A</AvatarFallback>
      </Avatar>
      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-success-text border-2 border-surface" />
    </div>
  ),
}

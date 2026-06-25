import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from '../components/ui/Badge'

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Badge>

export const Default: Story = { args: { children: 'Default' } }
export const Secondary: Story = { args: { variant: 'secondary', children: 'Secondary' } }
export const Destructive: Story = { args: { variant: 'destructive', children: 'Destructive' } }
export const Outline: Story = { args: { variant: 'outline', children: 'Outline' } }

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-2 flex-wrap">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
}

export const InterestTags: Story = {
  render: () => (
    <div className="flex gap-2 flex-wrap">
      {['Gaming', 'Music', 'Tech', 'Art', 'Sports', 'Film'].map(tag => (
        <Badge key={tag} variant="secondary">{tag}</Badge>
      ))}
    </div>
  ),
}

export const MatchPercentage: Story = {
  render: () => (
    <Badge className="text-brand-primary bg-brand-primary/10 border-brand-primary/20 text-sm px-3 py-1">
      94% Match
    </Badge>
  ),
}

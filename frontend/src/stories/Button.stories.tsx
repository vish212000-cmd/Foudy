import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '../components/ui/Button'
import { Zap, Trash2 } from 'lucide-react'

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Primary interactive element. Uses design tokens only. Supports keyboard navigation and ARIA.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'danger'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'icon'],
    },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Button>

export const Primary: Story = {
  args: { variant: 'primary', children: 'Primary Button' },
}

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Secondary Button' },
}

export const Ghost: Story = {
  args: { variant: 'ghost', children: 'Ghost Button' },
}

export const Danger: Story = {
  args: { variant: 'danger', children: 'Delete Account', leftIcon: <Trash2 className="h-4 w-4" /> },
}

export const WithIcon: Story = {
  args: {
    variant: 'primary',
    children: 'Find Match',
    leftIcon: <Zap className="h-4 w-4" />,
  },
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4 flex-wrap">
      <Button variant="primary" size="sm">Small</Button>
      <Button variant="primary" size="md">Medium</Button>
      <Button variant="primary" size="lg">Large</Button>
    </div>
  ),
}

export const Loading: Story = {
  args: { variant: 'primary', children: 'Loading...', loading: true },
}

export const Disabled: Story = {
  args: { variant: 'primary', children: 'Disabled', disabled: true },
}

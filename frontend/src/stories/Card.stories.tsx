import type { Meta, StoryObj } from '@storybook/react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Avatar, AvatarFallback } from '../components/ui/Avatar'

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Card>

export const Simple: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>This is a description of the card content.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-text-secondary">Card body content goes here.</p>
      </CardContent>
    </Card>
  ),
}

export const ProfileSummary: Story = {
  render: () => (
    <Card className="w-72">
      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-xl">A</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>alex_dev</CardTitle>
            <CardDescription>Full-stack developer</CardDescription>
          </div>
          <div className="flex gap-2 flex-wrap justify-center">
            <Badge variant="secondary">Gaming</Badge>
            <Badge variant="secondary">Tech</Badge>
            <Badge variant="secondary">Music</Badge>
          </div>
          <Button variant="primary" className="w-full">Connect</Button>
        </div>
      </CardContent>
    </Card>
  ),
}

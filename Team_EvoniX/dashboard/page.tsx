import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile?.onboarding_completed) {
    redirect('/survey')
  }

  // Get survey data
  const { data: survey } = await supabase
    .from('survey_responses')
    .select('*')
    .eq('user_id', user.id)
    .order('completed_at', { ascending: false })
    .limit(1)
    .single()

  // Get points
  const { data: points } = await supabase
    .from('user_points')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-teal-50 to-orange-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-gray-800">
          Welcome, {profile?.full_name || 'there'}! 👋
        </h1>
        <p className="text-gray-600 mb-8">Here's your AI adoption progress</p>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-gray-600">Your Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-teal-600">{points?.points || 0}</div>
              <p className="text-sm text-gray-500">Level {points?.level || 1}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-gray-600">AI Readiness Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-teal-600">{survey?.ai_readiness_score || 0}/100</div>
              <Progress value={survey?.ai_readiness_score || 0} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-gray-600">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/assistant">Talk to AI Assistant</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Roadmap */}
        <Card>
          <CardHeader>
            <CardTitle>Your AI Roadmap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {survey?.roadmap?.map((item: any, index: number) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                    <span className="text-sm text-gray-500">{item.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
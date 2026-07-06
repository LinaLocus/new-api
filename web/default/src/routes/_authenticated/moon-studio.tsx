/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { useMemo } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useActiveChatKey } from '@/features/chat/hooks/use-active-chat-key'
import { useStatus } from '@/hooks/use-status'

export const Route = createFileRoute('/_authenticated/moon-studio')({
  component: MoonStudioPage,
})

function MoonStudioPage() {
  const { t } = useTranslation()
  const { status } = useStatus()
  const { data: activeKey, error: keyError, isLoading } = useActiveChatKey(true)

  const serverAddress = status?.ServerAddress || window.location.origin

  const iframeSrc = useMemo(() => {
    if (!activeKey) return null

    // 构建 Moon Studio URL，传递 API Key 和 Base URL
    // locked=1 锁定渠道配置，禁止用户切换到其他供应商
    const canvasUrl = new URL('https://canvas.moonisapi.com')
    canvasUrl.searchParams.set('apiKey', activeKey)
    canvasUrl.searchParams.set('baseUrl', serverAddress)
    canvasUrl.searchParams.set('locked', '1')

    return canvasUrl.toString()
  }, [activeKey, serverAddress])

  if (isLoading) {
    return (
      <div className='flex h-full flex-col items-center justify-center gap-3'>
        <Loader2 className='text-muted-foreground h-8 w-8 animate-spin' />
        <p className='text-muted-foreground text-sm'>
          {t('Loading Moon Studio...')}
        </p>
      </div>
    )
  }

  if (keyError || !activeKey) {
    const message =
      keyError instanceof Error
        ? keyError.message
        : t('No enabled API keys found. Create or enable one first.')

    return (
      <div className='flex h-full flex-col items-center justify-center p-6'>
        <Alert variant='destructive' className='max-w-xl'>
          <AlertTitle>{t('Unable to open Moon Studio')}</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!iframeSrc) {
    return (
      <div className='flex h-full flex-col items-center justify-center p-6'>
        <Alert variant='destructive' className='max-w-xl'>
          <AlertTitle>{t('Unable to open Moon Studio')}</AlertTitle>
          <AlertDescription>
            {t('Unable to generate canvas link. Please contact your administrator.')}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <iframe
      src={iframeSrc}
      key={iframeSrc}
      className='h-full w-full border-0'
      allow='camera; microphone'
      title='Moon Studio - Infinite Canvas'
    />
  )
}

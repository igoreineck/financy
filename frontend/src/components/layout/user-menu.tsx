import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useLogout } from '@/lib/auth'
import { getInitials } from '@/lib/initials'
import { useAuthStore } from '@/store/auth'
import { LogOut, User } from 'lucide-react'
import { useNavigate } from 'react-router'

export function UserMenu() {
  const user = useAuthStore(s => s.user)
  const logout = useLogout()
  const navigate = useNavigate()

  if (!user) return null

  const initials = getInitials(user.name)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Menu for ${user.name}`}
        className="inline-flex size-10 cursor-pointer items-center justify-center rounded-full bg-brand-base text-sm font-semibold text-white transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-base/40"
      >
        {initials}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onSelect={() => navigate('/profile')}>
          <User className="size-4" aria-hidden="true" />
          My profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            void logout()
          }}
          className="text-danger focus:text-danger data-[highlighted]:text-danger"
        >
          <LogOut className="size-4" aria-hidden="true" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

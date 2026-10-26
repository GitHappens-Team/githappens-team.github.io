import mascot from '@/assets/brand/mascot-on-yellow.png'
import { cn } from '@/lib/utils'

// Upper-left nav lockup: mascot + pixel "git" over display "HAPPENS".
export function NavLogo({ className, ...props }: React.ComponentProps<'a'>) {
  return (
    <a
      href="#top"
      className={cn('flex min-h-11 items-center gap-4 no-underline', className)}
      {...props}
    >
      <img src={mascot} alt="git HAPPENS mascot" className="block size-12" />
      <span className="flex flex-col leading-[0.9]">
        <span className="font-pixel text-[28px] leading-[0.8]">git</span>
        <span className="text-[26px] font-extrabold tracking-[-0.01em]">HAPPENS</span>
      </span>
    </a>
  )
}

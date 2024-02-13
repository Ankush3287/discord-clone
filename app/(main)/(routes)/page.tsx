
import { ModeToggle } from "@/components/mode-toggle";
import { UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div >
      <UserButton
        afterSignOutUrl="http://localhost:3000/"
      />
      <ModeToggle />
    </div>
  );
}

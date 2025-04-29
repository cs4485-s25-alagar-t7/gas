import { UserCircle } from "lucide-react"
import { Card } from "../../@/components/ui/card"

const Navbar = () => {
  return (
    <Card className="flex justify-end items-center bg-[#D15716] shadow-md p-4 rounded-none border-none">
      <div className="inline-flex items-center text-white">
        <UserCircle className="w-5 h-5" />
        <span className="ml-2">Hiring Manager</span>
      </div>
    </Card>
  );
};

export default Navbar;
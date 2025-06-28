import { motion } from "framer-motion";
import { User, Mail, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

function RegisterPage() {
  const inputVariants = {
    focus: { scale: 1.05, transition: { duration: 0.3 } },
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-lg shadow-md w-96"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Sign Up</h1>

        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <motion.div whileFocus="focus" variants={inputVariants}>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  className="pl-10"
                  required
                />
              </div>
            </motion.div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <motion.div whileFocus="focus" variants={inputVariants}>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="pl-10"
                  required
                />
              </div>
            </motion.div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <motion.div whileFocus="focus" variants={inputVariants}>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="pl-10"
                  required
                />
              </div>
            </motion.div>
          </div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button type="submit" className="w-full">
              Sign up
            </Button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}

export default RegisterPage;

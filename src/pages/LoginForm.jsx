import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const loginSchema = z.object({
  //email: z.string().email({ message: "Username invalide" }),
  password: z.string().min(5, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
});

export default function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = (data) => {
    login(data);
    toast({
      title: "Connexion réussie",
      description: "Vous êtes maintenant connecté",
    });
    navigate("/dashboard");
  };

  return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md shadow-md">
          <CardHeader>
            <CardTitle>Connexion</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label>Text</Label>
                <Input type="text" placeholder="usernamem" {...register("email")} />
                {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
              </div>

              <div>
                <Label>Mot de passe</Label>
                <Input type="password" placeholder="••••••" {...register("password")} />
                {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
              </div>

              <Button type="submit" className="w-full">Se connecter</Button>
            </form>
          </CardContent>
        </Card>
      </div>
  );
}

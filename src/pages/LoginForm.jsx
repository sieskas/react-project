import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const loginSchema = z.object({
  username: z.string().min(3, { message: "Le nom d'utilisateur doit contenir au moins 3 caractères" }),
  password: z.string().min(5, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
});

export default function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const { login } = useAuth();

  const onSubmit = async (data) => {
    try {
      await login(data);
    } catch (error) {
      toast({
        title: "Erreur de connexion",
        description: "Identifiants invalides",
        variant: "destructive",
      });
    }
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
                <Label>Nom d'utilisateur</Label>
                <Input type="text" {...register("username")} />
                {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
              </div>

              <div>
                <Label>Mot de passe</Label>
                <Input type="password" {...register("password")} />
                {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
              </div>

              <Button type="submit" className="w-full">Se connecter</Button>
            </form>
          </CardContent>
        </Card>
      </div>
  );
}

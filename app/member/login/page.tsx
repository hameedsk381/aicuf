"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z.string().min(1, { message: "Password is required." }),
});

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { email: "", password: "" },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Something went wrong");
            }
            router.push("/member/dashboard");
            router.refresh();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to login");
        } finally {
            setIsLoading(false);
        }
    }

    async function handlePasskeyLogin() {
        const email = form.getValues("email");
        if (!email) {
            setError("Please enter email for passkey login");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            // Step 1: get options
            const optsRes = await fetch("/api/auth/passkey/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, step: "options" }),
            });
            const opts = await optsRes.json();
            if (!optsRes.ok) throw new Error(opts.error || "Failed to get passkey options");

            const { startAuthentication } = await import("@simplewebauthn/browser");
            const authResponse = await startAuthentication(opts);

            // Step 2: verify
            const verifyRes = await fetch("/api/auth/passkey/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, step: "verify", assertionResponse: authResponse }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.error || "Passkey login failed");

            router.push("/member/dashboard");
            router.refresh();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Passkey login error");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="container flex items-center justify-center min-h-screen py-12">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Member Login</CardTitle>
                    <CardDescription>Enter your email and password to access the member portal.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="john@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="******" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button
                                type="button"
                                className="w-full"
                                disabled={isLoading}
                                onClick={handlePasskeyLogin}
                            >
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Login with Passkey
                            </Button>
                            <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Login with Password
                            </Button>
                        </form>
                        <div className="mt-4 text-center text-sm text-muted-foreground">
                            Don't have a passkey?{" "}
                            <a href="/member/passkey/register" className="text-primary hover:underline">
                                Register one here
                            </a>
                        </div>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}

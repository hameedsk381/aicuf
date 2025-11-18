"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";

export default function PasskeyRegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [email, setEmail] = useState("");

    async function handleRegisterPasskey() {
        if (!email) {
            setError("Please enter your email address");
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(false);

        try {
            console.log("Starting passkey registration for:", email);

            // Step 1: Get registration options
            const optsRes = await fetch("/api/auth/passkey/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, step: "options" }),
            });
            const opts = await optsRes.json();
            console.log("Registration options response:", opts);

            if (!optsRes.ok) {
                console.error("Failed to get options:", opts);
                throw new Error(opts.error || "Failed to get passkey options");
            }

            console.log("Starting WebAuthn registration with browser...");
            // Step 2: Start registration with browser
            const { startRegistration } = await import("@simplewebauthn/browser");
            const attResp = await startRegistration(opts);
            console.log("Got attestation response:", attResp);

            // Step 3: Verify registration
            console.log("Verifying registration...");
            const verifyRes = await fetch("/api/auth/passkey/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, step: "verify", attestationResponse: attResp }),
            });
            const verifyData = await verifyRes.json();
            console.log("Verification response:", verifyData);

            if (!verifyRes.ok) {
                console.error("Verification failed:", verifyData);
                throw new Error(verifyData.error || "Failed to register passkey");
            }

            console.log("Passkey registered successfully!");
            setSuccess(true);
            setTimeout(() => router.push("/member/login"), 2000);
        } catch (e) {
            console.error("Passkey registration error:", e);
            setError(e instanceof Error ? e.message : "Passkey registration failed");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="container flex items-center justify-center min-h-screen py-12">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Register Passkey</CardTitle>
                    <CardDescription>
                        Register a passkey to enable biometric login for your account.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    {success && (
                        <Alert className="border-green-500 text-green-700">
                            <CheckCircle className="h-4 w-4" />
                            <AlertTitle>Success!</AlertTitle>
                            <AlertDescription>
                                Passkey registered successfully. Redirecting to login...
                            </AlertDescription>
                        </Alert>
                    )}
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">
                            Email Address
                        </label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="john@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading || success}
                        />
                    </div>
                    <Button
                        onClick={handleRegisterPasskey}
                        className="w-full"
                        disabled={isLoading || success}
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Register Passkey
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => router.push("/member/login")}
                        className="w-full"
                        disabled={isLoading}
                    >
                        Back to Login
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

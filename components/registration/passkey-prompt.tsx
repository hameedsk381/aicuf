"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Fingerprint, Loader2, CheckCircle, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface PasskeyPromptProps {
    email: string;
    onComplete: (success: boolean) => void;
}

export default function PasskeyPrompt({ email, onComplete }: PasskeyPromptProps) {
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    async function handleRegisterPasskey() {
        setIsRegistering(true);
        setError(null);

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
            setTimeout(() => onComplete(true), 1500);
        } catch (e) {
            console.error("Passkey registration error:", e);
            setError(e instanceof Error ? e.message : "Passkey registration failed");
        } finally {
            setIsRegistering(false);
        }
    }

    useEffect(() => {
        if (!success && !isRegistering) {
            handleRegisterPasskey();
        }
    }, [success, isRegistering]);

    if (success) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
            >
                <div className="flex justify-center mb-6">
                    <CheckCircle className="h-16 w-16 text-green-500" />
                </div>
                <h2 className="text-2xl font-light text-maroon mb-4">Biometric Login Enabled!</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                    You can now use your fingerprint or face to login quickly and securely.
                </p>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto py-12"
        >
            <div className="text-center mb-8">
                <div className="flex justify-center mb-6">
                    <div className="bg-primary/10 p-4 rounded-full">
                        <Fingerprint className="h-12 w-12 text-primary" />
                    </div>
                </div>
                <h2 className="text-2xl font-light text-maroon mb-4">
                    Your Account is Ready!
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto mb-2">
                    Set up biometric login for faster and more secure access. Use your fingerprint, face, or device PIN.
                </p>
                <p className="text-sm text-muted-foreground">
                    This step is required to complete your registration.
                </p>
            </div>

            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button
                    onClick={handleRegisterPasskey}
                    disabled={isRegistering}
                    className="rounded-none bg-maroon hover:bg-maroon/90 text-white"
                >
                    {isRegistering && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isRegistering ? "Setting up..." : "Set up Biometric Login"}
                </Button>
            </div>

            {error && (
                <div className="text-center mt-4">
                    <Button
                        variant="link"
                        onClick={() => setError(null)}
                        className="text-sm text-muted-foreground"
                    >
                        Try Again
                    </Button>
                </div>
            )}
        </motion.div>
    );
}

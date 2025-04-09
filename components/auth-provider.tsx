"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { Session, User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

type AuthContextType = {
    user: User | null
    session: Session | null
    isLoading: boolean
    signIn: (email: string, password: string) => Promise<void>
    signUp: (email: string, password: string, companyName: string) => Promise<void>
    signOut: () => Promise<void>
    signInWithGoogle: () => Promise<void>
    signInWithGithub: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const setData = async () => {
            const {
                data: { session },
                error,
            } = await supabase.auth.getSession()
            if (error) {
                console.error(error)
                setIsLoading(false)
                return
            }

            setSession(session)
            setUser(session?.user ?? null)
            setIsLoading(false)
        }

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            setUser(session?.user ?? null)
            setIsLoading(false)
            router.refresh()
        })

        setData()

        return () => {
            subscription.unsubscribe()
        }
    }, [router])

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push("/onboarding")
    }

    const signUp = async (email: string, password: string, companyName: string) => {
        const {
            data: { user },
            error: signUpError,
        } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    company_name: companyName,
                },
            },
        })

        console.log(user)
        console.log(signUpError)

        if (signUpError) {
            console.error(signUpError)
            throw signUpError
        }

        if (user) {
            // Create company record
            const { data: company, error: companyError } = await supabase
                .from("companies")
                .insert({ name: companyName })
                .select("id")
                .single()

            if (companyError) throw companyError

            // Link user to company
            const { error: userError } = await supabase.from("users").insert({
                id: user.id,
                email: user.email!,
                company_id: company.id,
            })

            if (userError) throw userError

            router.push("/onboarding")
        }
    }

    const signOut = async () => {
        await supabase.auth.signOut()
        router.push("/login")
    }

    const signInWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/callback`,
            },
        })
        if (error) throw error
    }

    const signInWithGithub = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "github",
            options: {
                redirectTo: `${window.location.origin}/callback`,
            },
        })
        if (error) throw error
    }

    const value = {
        user,
        session,
        isLoading,
        signIn,
        signUp,
        signOut,
        signInWithGoogle,
        signInWithGithub,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}

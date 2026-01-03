import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../firebase-setup/firebase";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Monitor Firebase Auth state
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                try {
                    let userDocRef = doc(db, "Users", currentUser.uid);
                    let userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setUser({
                            uid: currentUser.uid,
                            email: currentUser.email,
                            name: userData.firstname + ' ' + userData.lastname, // Ensure name exists
                            ...userData
                        });
                    } else {
                        console.warn("User authenticated but no Firestore profile found.");
                        setUser(currentUser);
                    }

                } catch (error) {
                    console.error("Error fetching user profile:", error);
                    setUser(currentUser);
                }
            } else {
                // Check Local Storage for our custom session
                const storedUser = localStorage.getItem("sms_user");
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                } else {
                    setUser(null);
                }
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email, password, role) => {
        // 1. Check Hardcoded Admin
        // "admin is always hardcoded and it have email and password nothing else"
        if (email === "admin@school.com" && password === "admin123") {
            const adminUser = {
                uid: "admin-hardcoded-id",
                email: "admin@school.com",
                role: "admin",
                firstname: "Super",
                lastname: "Admin",
                name: "Super Admin"
            };
            setUser(adminUser);
            localStorage.setItem("sms_user", JSON.stringify(adminUser));
            localStorage.setItem("uid", adminUser.uid);
            return adminUser;
        }

        // 2. Check Teacher/Student by ID and Password (stored in Firestore)
        // User enters their "ID" in the email field.
        try {
            // We search the 'Users' collection for a document with this 'id'
            // The user requested: "admin assign teacher and student their id and password... usage as email and pass"

            // NOTE: Ideally we should query by 'id' field, but earlier analysis showed users are stored with keys.
            // Let's assume the 'id' field inside the doc matches the input 'email' (which is the ID).

            const usersRef = collection(db, "Users");
            // Query where the 'id' field matches the input
            const q = query(usersRef, where("id", "==", email));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                throw new Error("User not found with this ID.");
            }

            // Should be unique, but take first found
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();

            // Verify Role matches the selected tab
            if (role && userData.role !== role) {
                throw new Error(`This account is not registered as a ${role}.`);
            }

            // Verify Password
            if (userData.password !== password) {
                throw new Error("Incorrect password.");
            }

            // Construct user object
            const authUser = {
                uid: userDoc.id, // Firestore Doc ID
                name: (userData.firstname || '') + ' ' + (userData.lastname || ''),
                ...userData
            };

            setUser(authUser);
            localStorage.setItem("sms_user", JSON.stringify(authUser));
            localStorage.setItem("uid", authUser.uid);
            return authUser;

        } catch (error) {
            console.error("Login Check Failed:", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            localStorage.removeItem("sms_user"); // Clean up legacy local storage if present
            localStorage.removeItem("uid");
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const value = {
        user,
        login,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

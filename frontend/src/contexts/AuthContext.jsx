import { createContext, useState } from 'react';
import { api } from '../services/apiClient';
import { destroyCookie, setCookie, parseCookies } from 'nookies';
import Router from 'next/router';
import { toast } from 'react-toastify';

export const AuthContext = createContext({})

export function signOut() {
    try {
        destroyCookie(undefined, '@nextauth.token');
        Router.push('/');
    } catch {
        console.log('erro ao deslogar');
    }
}

export function AuthProvider({ children }){
    const [user, setUser] = useState();
    const isAuthenticated = !!user;

    async function signIn({ email, password }){
        //if (typeof email === 'string' && typeof password === 'string'){}
        try{
            const response = await api.post('/session', {
                email,
                password
            });
            // console.log(response.data);

            const { id, name, token } = response.data;

            setCookie(undefined, '@nextauth.token', token, {
                maxAge: 60 * 60 * 24 * 30, // Expira em 1 mês
                path: "/" // Quais caminhos terão acesso ao cookie
            });

            setUser({
                id,
                name,
                email,
            });

            // Passar para as próximas requisições o nosso token
            api.defaults.headers['Authorization'] = `Bearer ${token}`;
            toast.success('Logado com sucesso!');

            Router.push('/studentDash');

        }catch(err){
            toast.error("Erro ao acessar!");
            console.log("Erro ao acessar ", err);
        }
    }

    async function registerStudent({name, birthDate, phone, cpf, email, user_id}){
        try{
            const response = await api.post('/students', {
                name,
                birthDate,
                phone,
                cpf,
                email,
                user_id
            })

            //alert('Aluno cadastrado com sucesso!')
            toast.success('Aluno cadastrado com sucesso!');
            //Router.push('/registerStudent');
        }catch(err){
            toast.error("Erro ao cadastrar!");
            console.log("erro ao cadastrar aluno ", err)
        }
    }

    return(
        <AuthContext.Provider value={{ user, isAuthenticated, signIn, signOut, registerStudent }}>
            {children}
        </AuthContext.Provider>
    )
}
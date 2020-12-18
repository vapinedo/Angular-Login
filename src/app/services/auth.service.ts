import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UsuarioModel } from '../models/usuario.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private url = 'https://identitytoolkit.googleapis.com/v1/accounts:';
  private apikey = 'AIzaSyAGBI-A6WPNrGUynUFlHz2K5HzxCMPuoAE';
  userToken: string;

  constructor( 
    private httpClient: HttpClient 
    ) {
      this.leerToken();
  }

  logout() {
    localStorage.removeItem('token');
  }

  login( usuario: UsuarioModel ) {
    const authData = {
      ...usuario,
      returnSecureToken: true
    }

    return this.httpClient.post(
      `${ this.url }signInWithPassword?key=${ this.apikey }`,
      authData 
    ).pipe(
      map( resp => {
        this.guardarToken( resp['idToken'] );
        return resp;
      })
    );
  }

  nuevoUsuario( usuario: UsuarioModel ) {
    const authData = {
      // email: usuario.email,
      // password: usuario.password,
      // usaremos el operador spread que hace lo mismo que lo anterior
      ...usuario,
      returnSecureToken: true
    }

    return this.httpClient.post(
      `${ this.url }signUp?key=${ this.apikey }`,
      authData
    ).pipe(
      map( resp => {
        this.guardarToken( resp['idToken'] );
        return resp;
      })
    );
  }

  private guardarToken( idToken: string ) {
    this.userToken = idToken;
    localStorage.setItem('token', idToken );

    let hoy = new Date();
    hoy.setSeconds( 3600  );

    localStorage.setItem('expira', hoy.getTime().toString() );
  }

  leerToken() {
    if ( localStorage.getItem('token') ) {
      this.userToken = localStorage.getItem('token');
    } else {
      this.userToken = '';
    }

    return this.userToken;
  }

  estaAutenticado(): boolean {

    // token no valido ( no existe )
    if ( this.userToken.length < 2 ) {
      return false;
    }

    const expira = Number( localStorage.getItem('expira') );
    const expiraDate = new Date();
    expiraDate.setTime(expira);

    if ( expiraDate > new Date() ) {
      return true;
    } else {
      return false;
    }
    
  }


}
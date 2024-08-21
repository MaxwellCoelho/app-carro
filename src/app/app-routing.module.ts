import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { NAVIGATION } from 'src/app/helpers/navigation.helper';

const routes: Routes = [
  {
    path: NAVIGATION.best.route,
    loadChildren: () => import('./pages/melhores/melhores.module').then( m => m.MelhoresPageModule)
  },
  {
    path: NAVIGATION.search.route,
    loadChildren: () => import('./pages/busca/busca.module').then( m => m.BuscaPageModule)
  },
  {
    path: `${NAVIGATION.search.route}/:marca`,
    loadChildren: () => import('./pages/busca/busca.module').then( m => m.BuscaPageModule)
  },
  {
    path: NAVIGATION.compare.route,
    loadChildren: () => import('./pages/comparar/comparar.module').then( m => m.CompararPageModule)
  },
  {
    path: NAVIGATION.favorite.route,
    loadChildren: () => import('./pages/favoritos/favoritos.module').then( m => m.FavoritosPageModule)
  },
  {
    path: NAVIGATION.garage.route,
    loadChildren: () => import('./pages/garagem/garagem.module').then( m => m.GaragemPageModule)
  },
  {
    path: 'garagem/:usuario',
    loadChildren: () => import('./pages/garagem/garagem.module').then( m => m.GaragemPageModule)
  },
  {
    path: NAVIGATION.term.route,
    loadChildren: () => import('./pages/termo-de-uso/termo-de-uso.module').then( m => m.TermoDeUsoPageModule)
  },
  {
    path: NAVIGATION.recoverypassword.route,
    loadChildren: () => import('./pages/recuperar-senha/recuperar-senha.module').then( m => m.RecuperarSenhaPageModule)
  },
  {
    path: NAVIGATION.settings.route,
    loadChildren: () => import('./pages/configuracoes/configuracoes.module').then( m => m.ConfiguracoesPageModule)
  },
  {
    path: NAVIGATION.admin.route,
    loadChildren: () => import('./pages/admin/admin.module').then( m => m.AdminPageModule)
  },
  {
    path: NAVIGATION.login.route,
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'opiniao/:marca/:modelo',
    loadChildren: () => import('./pages/opiniao/opiniao.module').then( m => m.OpiniaoPageModule)
  },
  {
    path: 'opinar/:marca/:modelo',
    loadChildren: () => import('./pages/opinar/opinar.module').then( m => m.OpinarPageModule)
  },
  {
    path: 'opinar/:marca',
    pathMatch: 'full',
    redirectTo: `${NAVIGATION.search.route}/:marca`
  },
  {
    path: 'opiniao/:marca',
    pathMatch: 'full',
    redirectTo: `${NAVIGATION.search.route}/:marca`
  },
  {
    path: 'opinar',
    pathMatch: 'full',
    redirectTo: NAVIGATION.search.route
  },
  {
    path: 'opiniao',
    pathMatch: 'full',
    redirectTo: NAVIGATION.search.route
  },
  {
    path: '**',
    redirectTo: NAVIGATION.best.route,
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, scrollPositionRestoration: 'top' } )
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

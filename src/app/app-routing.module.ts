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
    path: NAVIGATION.help.route,
    loadChildren: () => import('./pages/ajuda/ajuda.module').then( m => m.AjudaPageModule)
  },
  {
    path: NAVIGATION.term.route,
    loadChildren: () => import('./pages/termo-de-uso/termo-de-uso.module').then( m => m.TermoDeUsoPageModule)
  },
  {
    path: NAVIGATION.settings.route,
    loadChildren: () => import('./pages/configuracoes/configuracoes.module').then( m => m.ConfiguracoesPageModule)
  },
  {
    path: NAVIGATION.perfil.route,
    loadChildren: () => import('./pages/perfil/perfil.module').then( m => m.PerfilPageModule)
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
    path: '',
    redirectTo: NAVIGATION.best.route,
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, scrollPositionRestoration: 'enabled' } )
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

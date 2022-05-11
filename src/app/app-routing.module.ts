import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'melhores',
    loadChildren: () => import('./pages/melhores/melhores.module').then( m => m.MelhoresPageModule)
  },
  {
    path: 'busca',
    loadChildren: () => import('./pages/busca/busca.module').then( m => m.BuscaPageModule)
  },
  {
    path: 'comparar',
    loadChildren: () => import('./pages/comparar/comparar.module').then( m => m.CompararPageModule)
  },
  {
    path: 'favoritos',
    loadChildren: () => import('./pages/favoritos/favoritos.module').then( m => m.FavoritosPageModule)
  },
  {
    path: 'garagem',
    loadChildren: () => import('./pages/garagem/garagem.module').then( m => m.GaragemPageModule)
  },
  {
    path: 'ajuda',
    loadChildren: () => import('./pages/ajuda/ajuda.module').then( m => m.AjudaPageModule)
  },
  {
    path: 'termo-de-uso',
    loadChildren: () => import('./pages/termo-de-uso/termo-de-uso.module').then( m => m.TermoDeUsoPageModule)
  },
  {
    path: 'configuracoes',
    loadChildren: () => import('./pages/configuracoes/configuracoes.module').then( m => m.ConfiguracoesPageModule)
  },
  {
    path: 'perfil',
    loadChildren: () => import('./pages/perfil/perfil.module').then( m => m.PerfilPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: '',
    redirectTo: 'melhores',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

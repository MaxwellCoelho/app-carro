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

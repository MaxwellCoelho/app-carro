import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'melhores',
    loadChildren: () => import('./melhores/melhores.module').then( m => m.MelhoresPageModule)
  },
  {
    path: 'busca',
    loadChildren: () => import('./busca/busca.module').then( m => m.BuscaPageModule)
  },
  {
    path: 'comparar',
    loadChildren: () => import('./comparar/comparar.module').then( m => m.CompararPageModule)
  },
  {
    path: 'favoritos',
    loadChildren: () => import('./favoritos/favoritos.module').then( m => m.FavoritosPageModule)
  },
  {
    path: 'garagem',
    loadChildren: () => import('./garagem/garagem.module').then( m => m.GaragemPageModule)
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

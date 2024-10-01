# flake.nix
{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = {nixpkgs, ...}: let
    system = "x86_64-linux";
    pkgs = nixpkgs.legacyPackages.${system};
  in {
    devShells.${system}.default = pkgs.mkShell {

      packages = with pkgs; [ 
        nodePackages."@angular/cli"
        nodejs
        pnpm
        nodePackages.typescript-language-server

      ];
      # ...

    };
  };
}

  
  
  

  
  

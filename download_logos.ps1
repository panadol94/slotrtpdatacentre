$providers = @{
    "Joker" = "https://mbi8fun.today/media/ea837992792965cba95e5.png";
    "AdvantPlay" = "https://mbi8fun.today/media/e59de83bdd446.png";
    "MegaH5" = "https://mbi8fun.today/media/6b60f4c3dce860b4e145d.webp";
    "AceWin" = "https://mbi8fun.today/media/7c8ece9d0e696cf5c6b9e.png";
    "JILI" = "https://mbi8fun.today/media/526aba7fcce86adf2c1cf.webp";
    "NoLimit City" = "https://mbi8fun.today/media/6e5e2521dce86c27d0ae9.webp";
    "Yellow Bat" = "https://mbi8fun.today/media/2f44ab2ddce86d270ac10.webp";
    "Epic Win" = "https://mbi8fun.today/media/a4303560dce861ec2f5d1.webp";
    "EvoPlay" = "https://mbi8fun.today/media/57da9f28bb3965ec9b06a.png";
    "BigPot Gaming" = "https://mbi8fun.today/media/f7e79528bb3967140fb83.png";
    "KA Gaming" = "https://mbi8fun.today/media/142498f3dce862045bf92.webp";
    "Hacksaw Gaming" = "https://mbi8fun.today/media/79875111dce8682c27dfb.webp";
    "Relax Gaming" = "https://mbi8fun.today/media/7af97f24691560abb1a85.png";
    "Micro Slot" = "https://mbi8fun.today/media/7d582cbcdce86d205fa2b.webp";
    "Fastspin" = "https://mbi8fun.today/media/38e271fdcce86344a71d1.webp";
    "Rich88" = "https://mbi8fun.today/media/ff0d7f0c9ce86175e5101.webp";
    "Booongo" = "https://mbi8fun.today/media/9874582fcce86e16c7ade.webp";
    "UU Slots" = "https://mbi8fun.today/media/9be5163cdce860a22083d.webp";
    "Fa Chai" = "https://mbi8fun.today/media/5b45ec163819639e1d721.png";
    "918Kiss" = "https://mbi8fun.today/media/121a54712d58662419184.jpg";
    "Playtech" = "https://mbi8fun.today/media/ef1646812d58670f9960a.jpg";
    "Spadegaming" = "https://mbi8fun.today/media/2281ea812d58615de1204.webp";
    "Red Tiger" = "https://mbi8fun.today/media/c31173c12d5865f3b20c1.png";
}

$destDir = "c:\Users\Acer\Downloads\slot-rtp-data-centre\public\providers"

foreach ($name in $providers.Keys) {
    $url = $providers[$name]
    $ext = [System.IO.Path]::GetExtension($url)
    $outputFile = Join-Path $destDir "$name$ext"
    
    Write-Host "Downloading $name from $url to $outputFile..."
    try {
        Invoke-WebRequest -Uri $url -OutFile $outputFile
    } catch {
        Write-Error "Failed to download $name : $_"
    }
}

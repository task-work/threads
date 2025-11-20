"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

interface Props {
  routeType: string;
}

function Searchbar({ routeType }: Props) {
    const router = useRouter();
    const [search, setSearch] = useState("");

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if(search) {
                console.log("search key", search);
                router.push(`/${routeType}?q=` + search);
            }
            else {
                router.push(`/${routeType}`);
            }
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [search, routeType, router]);

    return (
        <div className="searchbar">
            <Image src='/assets/search-gray.svg' alt="search" width={24} height={24} className="object-contain" />
            <Input 
                id='text' 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                placeholder={`${routeType !== "search" ? "Search communities" : "Search creators"}`}
                className="not-focus searchbar_input text-base-regular"
             />   
        </div>
    );
}

export default Searchbar;
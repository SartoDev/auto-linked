import {Home, LucideProps, MoreHorizontal, Pencil, Search, Settings, Share, Trash2} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu, SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import {ForwardRefExoticComponent, RefAttributes, useEffect, useRef, useState} from "react";
import {useUser} from "@clerk/clerk-react";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {ChatService} from "@/chat/chat.service.ts";
import Chat from "@/chat/chat.ts";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {Button} from "@/components/ui/button.tsx";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog.tsx";
import {toast, Toaster} from "sonner";
import {useNavigate, useParams} from "react-router-dom";
import {Input} from "@/components/ui/input.tsx";

class Item {
    id: string;
    title: string;
    url: string;
    icon?: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
    tooltip: string;
    isRenaming: boolean = false;
    userId: string;

    constructor(id: string, title: string, url: string, tooltip: string, userId: string);
    constructor(id: string, title: string, url: string, tooltip: string, userId: string, icon?: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>) {
        this.id = id;
        this.userId = userId;
        this.title = title;
        this.url = url;
        this.tooltip = tooltip;
        this.icon = icon;
    }
}

export function AppSidebar() {
    const { user } = useUser();
    const [items, setItems] = useState<Item[]>([]);
    const chatService = new ChatService();
    const inputRef = useRef<HTMLInputElement | null>(null);
    const { chatId } = useParams();
    const navigate = useNavigate();
    const [copySuccess, setCopySuccess] = useState('');

    async function deleteChat(id: string) {
        const response = await chatService.delete(id);
        toast.success(response, {
            duration: 3000,
        });
        if(id === chatId) {
            navigate("/");
            return;
        }
        setItems([]);
        await fetchChats();
    }

    function convertChatItemList(chatList: Chat[]): Item[] {
        return chatList.map((chat: Chat) => new Item(chat.id, chat.name, chat.id.toString(), chat.name, chat.userId));
    }

    async function fetchChats() {
        const chatList =  await chatService.filterByUserId(user.id);
        setItems([{
            id: "",
            title: "Auto Linked",
            url: "/",
            icon: Home,
            tooltip: "New chat",
            isRenaming: false,
            userId: user.id,
        }, ...convertChatItemList(chatList)]);
    }

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [items]);

    const handleBlur = async (chat: Item) => {
        await chatService.update(chat.id, new Chat(chat.userId, chat.title));
        setItems([]);
        await fetchChats();
        setItems(prevItems =>
            prevItems.map(item =>
                item.id === chat.id ? {...item, isRenaming: false} : item
            )
        );
    };

    const handleRename = (id: string) => {
        setItems(prevItems =>
            prevItems.map(item =>
                item.id === id ? { ...item, isRenaming: true } : item
            )
        );
    };

    const handleChange = (id: string, value: string) => {
        setItems(prevItems =>
            prevItems.map(item =>
                item.id === id ? { ...item, title: value } : item
            )
        );
    };

    useEffect(() => {
        fetchChats()
    }, []);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(
            () => setCopySuccess('Texto copiado com sucesso!'),
            (err) => setCopySuccess('Falha ao copiar texto.')
        );
        toast.success("Copied successfully!", {
            duration: 3000
        })
    };

    return (
        <Sidebar>
            <SidebarContent style={{padding: "0 0.5rem"}}>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item, index) => (
                                <SidebarMenuItem key={item.id}>
                                    {item.isRenaming ?
                                        <Input ref={inputRef} className="w-full" value={item.title}
                                               onChange={(e) => handleChange(item.id, e.target.value)}
                                               onBlur={() => handleBlur(item)}
                                        />
                                        : <TooltipProvider>
                                        <Tooltip>
                                            <SidebarMenuItem>
                                                <TooltipTrigger asChild>
                                                    <SidebarMenuButton asChild>
                                                        <a href={item.url}>
                                                            {item.icon != null && <item.icon />}
                                                            <span>{item.title}</span>
                                                        </a>
                                                    </SidebarMenuButton>
                                                </TooltipTrigger>
                                                {index !== 0 && <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <SidebarMenuAction>
                                                            <MoreHorizontal />
                                                        </SidebarMenuAction>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent side="right" align="start">
                                                        {/*<div>*/}
                                                        {/*    <Button onClick={() => copyToClipboard(`https://auto-linked.vercel.app/${item.url}`)} className="w-full justify-start" variant="ghost">*/}
                                                        {/*        <Share/> Share*/}
                                                        {/*    </Button>*/}
                                                        {/*</div>*/}
                                                        <div>
                                                            <Button onClick={() => handleRename(item.id)} className="w-full justify-start" variant="ghost">
                                                                <Pencil/> Rename
                                                            </Button>
                                                        </div>
                                                        <div>
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button className="w-full justify-start text-red-500 hover:text-red-600" variant="ghost">
                                                                        <Trash2/> Delete
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Delete chat?</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            This will exclude <b>{item.title}.</b>
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction onClick={() => deleteChat(item.id)} className="bg-red-500 hover:bg-red-600">Continue</AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </div>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>}
                                            </SidebarMenuItem>
                                            <TooltipContent side="right">
                                                <p>{item.tooltip}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>}
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}
